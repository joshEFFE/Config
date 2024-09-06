import * as THREE from '../pjs/three.module.js';
import { OrbitControls } from '../pjs/OrbitControls.js';	
import { GLTFLoader } from '../pjs/GLTFLoader.js';
import { DRACOLoader } from '../pjs/DRACOLoader.js'
import * as mergeBufferGeometries from '../pjs/BufferGeometryUtils.js';
import { RGBELoader } from '../pjs/RGBELoader.js';	
import { GUI } from '../pjs/dat.gui.module.js';

	/*------------------------------GUI - Right side panel design-----------------------------*/

			let gui = new GUI();       
		    var conf = { 
		        download : function()
		                {
		                    downloadImage("test.png");
		                },
		        camera_angle : function()
		                {
		                    cameraAngle(camera);
		                },	
		        MaterialDesign: 
                {
                    Ruby :function(){ material_design_fn("ruby") }, 
                    Emarald :function(){ material_design_fn("emarald") },
                    Pearls :function(){ material_design_fn("pearls") }, 
                    Blackbeads :function(){ material_design_fn("blackbeads") }                                                
                },	                     
		    };           

		    gui.add(conf, "download").name("Download"); 
		    gui.add(conf, "camera_angle").name("Camera Angle"); 

		    let materialDesign = gui.addFolder('Materials');
            materialDesign.add(conf.MaterialDesign, 'Ruby').name("Ruby");
            materialDesign.add(conf.MaterialDesign, 'Emarald').name("Emarald");
            materialDesign.add(conf.MaterialDesign, 'Pearls').name("Pearls");
            materialDesign.add(conf.MaterialDesign, 'Blackbeads').name("Blackbeads");              

    /*------------------------------GUI - Right side panel design-----------------------------*/

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('./pjs/draco/');
	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);
	loader.setPath( './model/' );

	//variable declaration section
	let physicsWorld, scene, camera, renderer,controls,camera_angle_cou=0,physics_stop=true;
	let colGroupRedBall = 2, colGroupGreenBall = 4,tmpTrans,clock,rigidBodies_chain=[],rigidBodies_necklacependent=[];
	let display_pendent="",pendent_groups={},pendent_groups_name={},change_material_props={},necklace_groups={},necklace_groups_info={};
    let display_necklace="",necklace_chain_formation={};


	const setupPhysicsWorld = () => {
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -40,0));
    }

    const setupGraphics = () =>{
				/*Camera Settings*/			
                clock = new THREE.Clock();

                camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50000 );       
                camera.position.set(0,0,100);
			
				scene = new THREE.Scene();
				scene.background =  new THREE.Color( 0x000000);		

				scene.add(camera);

				/*Light Settings*/
				const Dir_light_size=50;

				/*Light Declaration*/
				const dl1 = new THREE.DirectionalLight( 0xffffff, 1 );
				const dl2 = new THREE.DirectionalLight( 0xffffff, 1 );
				const dl3 = new THREE.DirectionalLight( 0xffffff, 1 );
				const dl4 = new THREE.DirectionalLight( 0xffffff, 1 );

				/*Positions*/
				dl1.position.set( -30, 20, 2 );
				dl2.position.set( 30, 20, 2 );
				dl3.position.set( 0, 20, -30 );
				dl4.position.set( 0, 20, 30 );


				/*Castshadow , light size , near & far*/
				dl1.castShadow = dl2.castShadow = dl3.castShadow = dl4.castShadow = false;

				dl1.shadow.camera.right = dl2.shadow.camera.right = dl3.shadow.camera.right = dl4.shadow.camera.right = Dir_light_size;

				dl1.shadow.camera.left = dl2.shadow.camera.left = dl3.shadow.camera.left = dl4.shadow.camera.left = - Dir_light_size;

				dl1.shadow.camera.top = dl2.shadow.camera.top = dl3.shadow.camera.top = dl4.shadow.camera.top = Dir_light_size;

				dl1.shadow.camera.bottom = dl2.shadow.camera.bottom = dl3.shadow.camera.bottom = dl4.shadow.camera.bottom = - Dir_light_size;

				dl1.shadow.camera.near = dl2.shadow.camera.near = dl3.shadow.camera.near = dl4.shadow.camera.near = 1;

				dl1.shadow.camera.far = dl2.shadow.camera.far = dl3.shadow.camera.far = dl4.shadow.camera.far = 7000;

				scene.add( dl1 );
				scene.add( dl2 );
				scene.add( dl3 );
				scene.add( dl4 );					


				const spotLight = new THREE.SpotLight( 0xffffff,1 );
				spotLight.position.set( 0, 100, 0 );
				spotLight.castShadow = false;
				spotLight.shadow.mapSize.width = 5000;
				spotLight.shadow.mapSize.height = 5000;
				spotLight.shadow.camera.near = 1;
				spotLight.shadow.camera.far = 7000;
				spotLight.shadow.camera.fov = 10;
				spotLight.shadow.bias = -0.0001;
				scene.add( spotLight );

				/*Renderer Settings*/
				renderer = new THREE.WebGLRenderer({ antialias: true,preserveDrawingBuffer: true });
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.PCFSoftShadowMap;
				renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.toneMapping=THREE.LinearToneMapping;				
				document.body.appendChild( renderer.domElement );

				/*Orbit controls Settings*/
				controls = new OrbitControls( camera, renderer.domElement );
				controls.enableZoom = true;
				controls.enablePan = true;				
				window.addEventListener( 'resize', onWindowResize );				
	}

    /*-------------------------------------PRE - Load objects - start-----------------------------------*/
    let blackbeads_obj,emrald_obj,emrald_obj1,ruby_obj,ruby_obj1,pearls_obj,pearls_obj1;
    let material_assets_geo={};
    const preloadAssets = () =>{
            /*--------Blackbeads------------*/
            loader.load( 'Bo.glb', function ( gltf ) {                            
                    gltf.scene.traverse( function ( child ) {                          
                        if ( child.isMesh ) { 
                           blackbeads_obj=child; 
                        }
                    });                                    
                    material_assets_geo['blackbeads']=[blackbeads_obj.geometry];                                                                   
                },                      
                function ( xhr ) {
                    if( (xhr.loaded / xhr.total * 100 )==100 )
                    {                        
                    }
                },                      
                function ( error ) {
                    console.log( 'An error happened' );
                }
            );

            /*--------Emrald------------*/
            loader.load( 'Eo.glb', function ( gltf ) {                            
                gltf.scene.traverse( function ( child ) {                                
                    if ( child.isMesh ) {
                        if(child.name=="SpiroFit001")
                        {
                            emrald_obj=child;
                        }
                        else if(child.name=="SpiroFit001_1")
                        {
                            emrald_obj1=child;
                        }                                                               
                    }
                }); 
                material_assets_geo['emarald']=[emrald_obj.geometry,emrald_obj1.geometry];                                           
            },                      
            function ( xhr ) {
                if( (xhr.loaded / xhr.total * 100 )==100 )
                {                
                }
            },                      
            function ( error ) {
                console.log( 'An error happened' );
            }
            );

            /*--------Ruby------------*/
            loader.load( 'Ro.glb', function ( gltf ) {                            
                    gltf.scene.traverse( function ( child ) {                           
                        if ( child.isMesh ) {
                            if(child.name=="SpiroFit001_1")
                            {
                                ruby_obj=child;
                            }
                            else if(child.name=="SpiroFit001_2")
                            {
                                ruby_obj1=child;
                            }                                                                     
                        }
                    });
                    material_assets_geo['ruby']=[ruby_obj.geometry,ruby_obj1.geometry];                                    
                },                      
                function ( xhr ) {
                    if( (xhr.loaded / xhr.total * 100 )==100 )
                    {                    
                    }
                },                      
                function ( error ) {
                    console.log( 'An error happened' );
                }
            );    

            /*--------Pearls------------*/
            loader.load( 'Po.glb', function ( gltf ) {                            
                    gltf.scene.traverse( function ( child ) {                   
                        if ( child.isMesh ) {
                            if(child.name=="SpiroFit001_1")
                            {
                                pearls_obj=child;
                            }
                            else if(child.name=="SpiroFit001_2")
                            {
                                pearls_obj1=child;
                            }                                                                                            
                        }
                    }); 
                    material_assets_geo['pearls']=[pearls_obj.geometry,pearls_obj1.geometry];                         
                },                      
                function ( xhr ) {
                    if( (xhr.loaded / xhr.total * 100 )==100 )
                    {                         
                    }
                },                      
                function ( error ) {
                    console.log( 'An error happened' );
                }
            );
    };
    /*-------------------------------------PRE - Load objects - end-------------------------------------*/


	const start = () => {
		tmpTrans = new Ammo.btTransform();               
	    setupPhysicsWorld();
	    setupGraphics();
        preloadAssets();
	}

	const renderFrame = () =>{
        let deltaTime = clock.getDelta(); 
        if(physics_stop)
        {           
            updatePhysics( deltaTime*2 );                
        }
        controls.update();
        renderer.render( scene, camera );
        requestAnimationFrame( renderFrame );
    }

	const hdrEquirect = new RGBELoader().setPath( 'textures/equirectangular/' ).load( '1.hdr', function () {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        renderFrame();
    });          


	//Ammojs Initialization
	Ammo().then(start);

	const onWindowResize = () => 
	{
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	} 			

    const downloadImage = (filename) =>
    {
        var link = document.createElement('a');
        link.setAttribute('href', renderer.domElement.toDataURL());
        link.setAttribute('target', '_blank');
        link.setAttribute('download', filename);
        link.click();
    }

    const cameraAngle = () =>{

        var y_axis = new THREE.Vector3( 0, 1, 0 );
        var quaternion = new THREE.Quaternion;

        if(camera_angle_cou==0)
        {
            camera.position.set(0,0,233);
        }
        else if(camera_angle_cou==1)
        {
            camera.position.set(0,0,300);
        }
        else if(camera_angle_cou==2)
        {
            camera.position.set(0,0,150);
        }
        else if(camera_angle_cou==3)
        {                    
            camera.position.set(0,0,150);
            camera.position.applyQuaternion(quaternion.setFromAxisAngle(y_axis, 0.3964612592370183));
        }
        else if(camera_angle_cou==4)
        {                   
            camera.position.set(0,0,150);
            camera.position.applyQuaternion(quaternion.setFromAxisAngle(y_axis, -0.3964612592370183));
        }                 
        if(camera_angle_cou==4)
        {
            camera_angle_cou=-1;
        }
        camera_angle_cou++;               
    }



    /* ---------------------------------- Material Declaration - Start ------------------------------ */
    			//cubemap
                const dpath2 = 'bead/5/';
                const dformat2 = '.jpg';
                const durls2 = [
                    dpath2 + 'px' + dformat2, dpath2 + 'nx' + dformat2,
                    dpath2 + 'py' + dformat2, dpath2 + 'ny' + dformat2,
                    dpath2 + 'pz' + dformat2, dpath2 + 'nz' + dformat2
                ];

                const dreflectionCube2 = new THREE.CubeTextureLoader().load( durls2 );
                const drefractionCube2 = new THREE.CubeTextureLoader().load( durls2 );
                drefractionCube2.mapping = THREE.CubeRefractionMapping;

                //cubemap
                const dpath = 'dia2/';
                const dformat = '.jpg';
                const durls = [
                    dpath + 'px' + dformat, dpath + 'nx' + dformat,
                    dpath + 'py' + dformat, dpath + 'ny' + dformat,
                    dpath + 'pz' + dformat, dpath + 'nz' + dformat
                ];

                const dreflectionCube = new THREE.CubeTextureLoader().load( durls );
                const drefractionCube = new THREE.CubeTextureLoader().load( durls );
                drefractionCube.mapping = THREE.CubeRefractionMapping;

                //Bead Reflection map
                const path = 'reflect11/';
                const format = '.jpg';
                const urls = [
                    path + 'px' + format, path + 'nx' + format,
                    path + 'py' + format, path + 'ny' + format,
                    path + 'pz' + format, path + 'nz' + format
                ];

                const reflectionCube = new THREE.CubeTextureLoader().load( urls );
                const refractionCube = new THREE.CubeTextureLoader().load( urls );
                refractionCube.mapping = THREE.CubeRefractionMapping; 

                //Bead Reflection map
                const path2 = 'bead/1/';
                const format2 = '.jpg';
                const urls2 = [
                    path2 + 'px' + format2, path2 + 'nx' + format2,
                    path2 + 'py' + format2, path2 + 'ny' + format2,
                    path2 + 'pz' + format2, path2 + 'nz' + format2
                ];

                const reflectionCube2 = new THREE.CubeTextureLoader().load( urls2 );
                const refractionCube2 = new THREE.CubeTextureLoader().load( urls2 );
                refractionCube2.mapping = THREE.CubeRefractionMapping;              

                
                const canvas = document.createElement( 'canvas' );
                canvas.width = 2;
                canvas.height = 2;

                const context = canvas.getContext( '2d' );
                context.fillStyle = 'white';
                context.fillRect( 0, 1, 2, 1 );

                const texture = new THREE.CanvasTexture( canvas );
                texture.magFilter = THREE.NearestFilter;
                texture.wrapT = THREE.RepeatWrapping;
                texture.wrapS = THREE.RepeatWrapping;
                texture.repeat.set( 1, 3.5 );

                /*Beads Material*/
                const loader1 = new THREE.TextureLoader();
                const texture1 = loader1.load( '4.jpg', function ( texture ) {
                    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
                    texture1.offset.set( 0, 0 );
                    texture1.repeat.set( 1, 1 );
                });

    /* ----------------------------------- Material Declaration - End ------------------------------- */

    /*------------------------------LIST of change Material Designs-----------------------------*/
    let material_design={
                    "chain":[
                                new THREE.MeshStandardMaterial({ 
                                     color: 0xe37f0b,                                               
                                     envMap: drefractionCube2,                     
                                     side:THREE.DoubleSide,
                                     metalness:1,
                                     roughness:0.25,                                                                                        
                                })                              
                            ],
                    "peacock":[
                        new THREE.MeshStandardMaterial({ 
                             color: 0xd49613,                                                                         
                             metalness:0.8,
                             roughness:0.3,                                                                                        
                        })                              
                    ],
                    "ruby":[
                                new THREE.MeshStandardMaterial({ 
                                     color: 0xff204d,
                                     normalMap: new THREE.TextureLoader().load( 'NormalMap.png'),
                                     normalScale:new THREE.Vector2(0.03, 0.03),             
                                     envMap: reflectionCube2,                     
                                     side:THREE.DoubleSide,
                                     metalness:1,
                                     roughness:0,
                                     envMapIntensity: 0.05,
                                     transparent: true,
                                     opacity:0.85,
                                     map:texture1,                                                    
                                }),
                               new THREE.MeshStandardMaterial({ 
                                    color: 0xe37f0b, 
                                    envMap: drefractionCube2,
                                    side:THREE.DoubleSide,
                                    metalness:1,
                                    roughness:0.25 
                                }) 
                            ],
                    "emarald":[
                                new THREE.MeshStandardMaterial({ 
                                 color: 0x94dec2,
                                 normalMap: new THREE.TextureLoader().load( 'NormalMap.png'),
                                 normalScale:new THREE.Vector2(0.09, 0.09),             
                                 envMap: reflectionCube2,                     
                                 side:THREE.DoubleSide,
                                 metalness:1,
                                 roughness:0,
                                 envMapIntensity: 0.3,
                                 transparent: true,
                                 opacity:0.8,
                                 map:texture1,                                                   
                                }),
                                new THREE.MeshStandardMaterial({ 
                                    color: 0xe37f0b, 
                                    envMap: drefractionCube2,
                                    side:THREE.DoubleSide,
                                    metalness:1,
                                    roughness:0.25 
                                })                                
                              ],
                    "blackbeads":[
                                    new THREE.MeshStandardMaterial({ 
                                         color: 0x000000,
                                         normalMap: new THREE.TextureLoader().load( 'NormalMap.png'),
                                         normalScale:new THREE.Vector2(0.09, 0.09),             
                                         envMap: reflectionCube2,                     
                                         side:THREE.DoubleSide,
                                         metalness:1,
                                         roughness:0,
                                         envMapIntensity: 0.3,
                                         transparent: true,
                                         opacity:0.8,
                                         map:texture1,                                                    
                                    })
                                    
                                 ],
                    "pearls":[
                                new THREE.MeshPhongMaterial({ 
                                    color: 0xcfb9b9, 
                                    emissive:0x430b0b, 
                                    emissiveIntensity:2,
                                    map:new THREE.TextureLoader().load( '1.jpg'), 
                                    envMap: dreflectionCube2,
                                    side:THREE.DoubleSide,
                                    reflectivity:0.7,
                                    transparent:true,
                                    opacity:0.95,                           
                                    specular:0xcfb9b9
                                }),
                                 new THREE.MeshStandardMaterial({ 
                                    color: 0xe37f0b, 
                                    envMap: drefractionCube2,
                                    side:THREE.DoubleSide,
                                    metalness:1,
                                    roughness:0.25 
                                }) 
                             ] 

               };
    /*------------------------------LIST of change Material Designs-----------------------------*/

    /* ------------------------------------ Material Config Start ------------------------------------------ */
    		let material_design_config={

    			Pendent_Type_1:{
    				pen1001 	: 	new THREE.MeshStandardMaterial({ 
					                	color: 0x5f3326,
					                	envMap: drefractionCube2,
					                	map:new THREE.TextureLoader().load( '1.jpg'), 
					                	side:THREE.DoubleSide,
					                	metalness:1,
					                	roughness:0.35
					                }),
    				pen1001_1 	: 	new THREE.MeshStandardMaterial( {  
					                    envMap: drefractionCube,
					                    envMapIntensity:3,
					                    side:THREE.DoubleSide,
					                    metalness:1,
					                    roughness:0,            
					                    refractionRatio:0.2,
					                    transparent:true,
					                    opacity:0.8                                 
					                }),
    				pen1002_1 	: 	new THREE.MeshStandardMaterial( {  
					                    envMap: drefractionCube,
					                    envMapIntensity:3,
					                    side:THREE.DoubleSide,
					                    metalness:1,
					                    roughness:0,            
					                    refractionRatio:0.2,
					                    transparent:true,
					                    opacity:0.8                                 
					                }),
    				pen1002 	: 	new THREE.MeshStandardMaterial( {                   
					                    envMap: dreflectionCube,
					                    envMapIntensity:0.2,
					                    side:THREE.DoubleSide,
					                    metalness:1,
					                    roughness:0.15,
					                    transparent:true,
					                    opacity:0.7,
					                    color:0xff0000                 
					                }),
    				pen1002_2 	: 	new THREE.MeshStandardMaterial( {                      
					                    envMap: dreflectionCube,
					                    envMapIntensity:0.2,
					                    side:THREE.DoubleSide,
					                    metalness:1,
					                    roughness:0.15,
					                    transparent:true,
					                    opacity:0.7,
					                    color:0x006400         
					                })

    			},
    			Pendent_Type_2:{
    				mettel 	: 	 new THREE.MeshPhysicalMaterial( {
				                        color: 0xe8ae63,
				                        metalness: 1,
				                        roughness: 0,
				                        ior: 1.5,
				                        alphaMap: texture,
				                        envMap: hdrEquirect,
				                        envMapIntensity: 2.3,
				                        transmission: 1,                    
				                        opacity: 1,
				                        side: THREE.DoubleSide,
				                        transparent: true,
				                }),
    				common 	: 	new THREE.MeshStandardMaterial( { 
				                     color: 0xffffff,
				                     normalMap: new THREE.TextureLoader().load( 'NormalMap.png'),
				                     normalScale:new THREE.Vector2(0.09,0.09),              
				                     envMap: reflectionCube,                     
				                     side:THREE.DoubleSide,
				                     metalness:1,
				                     roughness:0,
				                     envMapIntensity: 1,
				                     transparent: true,                     
				                     opacity:0.95,
				                    map:texture,                                                    
				                }),
    			},
    			Pendent_Type_3:{
    				TANMONEA_3 	: 	 new THREE.MeshPhysicalMaterial( {
				                        color: 0xe8ae63,
				                        metalness: 1,
				                        roughness: 0,
				                        ior: 1.5,
				                        alphaMap: texture,
				                        envMap: hdrEquirect,
				                        envMapIntensity: 2.3,
				                        transmission: 1,                    
				                        opacity: 1,
				                        side: THREE.DoubleSide,
				                        transparent: true,
				                	}),
    				TANMONEA_3001 	: 	new THREE.MeshStandardMaterial( { 
						                     color: 0xffffff,
						                     normalMap: new THREE.TextureLoader().load( 'NormalMap.png'),
						                     normalScale:new THREE.Vector2(0.09,0.09),              
						                     envMap: reflectionCube,                     
						                     side:THREE.DoubleSide,
						                     metalness:1,
						                     roughness:0,
						                     envMapIntensity: 1,
						                     transparent: true,                     
						                     opacity:0.95,
						                    map:texture,                                                    
						                }),
    				TANMONEA_3002 	: 	 new THREE.MeshPhysicalMaterial( {
				                        color: 0xe8ae63,
				                        metalness: 1,
				                        roughness: 0,
				                        ior: 1.5,
				                        alphaMap: texture,
				                        envMap: hdrEquirect,
				                        envMapIntensity: 2.3,
				                        transmission: 1,                    
				                        opacity: 1,
				                        side: THREE.DoubleSide,
				                        transparent: true,
				                	}),
    				
    			},

    		};
    /* ------------------------------------- Material Config End ------------------------------------------- */

    /* ------------------------------------- Pendent Render functionality Start ---------------------------- */
 		const render_pendent_fn = (obj_name,model_name) => {

 				if(typeof scene.getObjectByName(display_pendent)!="undefined" && display_pendent!="")
				{
					scene.getObjectByName(display_pendent).visible=false;				
				} 
				if(typeof pendent_groups[display_pendent]!="undefined")
                {   
                  pendent_groups[display_pendent].hide();                      
                }
                if(typeof pendent_groups[obj_name]!="undefined")
                {
                    pendent_groups[obj_name].show();
                }	

				if(typeof scene.getObjectByName(obj_name)=="undefined")
				{
					let store_groups_info=[]; 
			        loader.load( model_name, function ( gltf ) {                            
                            gltf.scene.traverse( function ( child ) {                                
                                if ( child.isMesh ) {                                	
                                		if(typeof material_design_config[obj_name][child.name]!="undefined")
                                		{ 
                                		   	child.material=material_design_config[obj_name][child.name];
                                    	}
                                    	else
                                    	{
                                    		child.material=material_design_config[obj_name]['common'];
                                    	}
                                    	store_groups_info.push({"child_name":child.name,"object":child}); 
                                        child.name=obj_name;                                                                                                       
                                }
                            });   
                                          
                            gltf.scene.scale.set(Pendent_Types[obj_name].scale.x,Pendent_Types[obj_name].scale.y,Pendent_Types[obj_name].scale.z);
                            gltf.scene.position.set(Pendent_Types[obj_name].position.x,Pendent_Types[obj_name].position.y,Pendent_Types[obj_name].position.z);
                            gltf.scene.rotation.set(Pendent_Types[obj_name].rotation.x,Pendent_Types[obj_name].rotation.y,Pendent_Types[obj_name].rotation.z);
                            gltf.scene.name=obj_name;
                            scene.add( gltf.scene );
                            pendent_groups_name[obj_name]=store_groups_info;
                            render_pendent_groups(pendent_groups_name);
                        },                      
                        function ( xhr ) {
                            if( (xhr.loaded / xhr.total * 100 )==100 )
                            {           
                            }
                        },                      
                        function ( error ) {
                            console.log( 'An error happened' );
                        }
                    );
                }
                else
                {
                	scene.getObjectByName(obj_name).visible=true;
                }
                display_pendent=obj_name;                    
        };
    /* ------------------------------------- Pendent Render functionality End ---------------------------- */

    /* ------------------------------------- Pendent Groups - Start ---------------------------- */
        const render_pendent_groups = (pendent_groups_param) =>{               

                if(typeof pendent_groups[display_pendent]=="undefined")
                {
                    pendent_groups[display_pendent] = gui.addFolder(display_pendent+" - Groups");                    
                    for(let i=0;i<pendent_groups_param[display_pendent].length;i++)
                    {
                        let param={};
                        param[pendent_groups_param[display_pendent][i].child_name]=function(){
                        	change_material_props={};
                            change_material_props['type']='Pendent';
                        	change_material_props['name']=pendent_groups_param[display_pendent][i].child_name;
                        	change_material_props['object']=pendent_groups_param[display_pendent][i].object;
                            pendent_groups_param[display_pendent][i].object.visible=((pendent_groups_param[display_pendent][i].object.visible==true)?false:true);
                        };                       
                        pendent_groups[display_pendent].add(param, pendent_groups_param[display_pendent][i].child_name).name(pendent_groups_param[display_pendent][i].child_name);
                    }
                    let param={};
                    param['Reset']=function(){reset_design_fn("Pendent")};
                    pendent_groups[display_pendent].add(param,'Reset').name('Reset');
                }
        };
    /* ------------------------------------- Pendent Groups - End ---------------------------- */

    /* ------------------------------------- Necklace Groups - Start ---------------------------- */
        const render_necklace_groups = (necklace_groups_param) =>{
            if(typeof necklace_groups[display_necklace]=="undefined")
            {
                necklace_groups[display_necklace] = gui.addFolder(display_necklace+" - Groups");                    
                for(let i=0;i<necklace_groups_param.length;i++)
                {
                    let param={};
                    param[necklace_groups_param[i]]=function(){
                        change_material_props={};
                        change_material_props['type']='Necklace';
                        change_material_props['name']=necklace_groups_param[i];                                       
                       
                       for(let l=0;l<necklace_groups_info.length;l++)
                       {
                            if(necklace_groups_info[l].child_name.localeCompare(necklace_groups_param[i])==0)
                            {    
                                if(necklace_groups_info[l].stop!="stop")                            
                                {
                                    necklace_groups_info[l].object.visible=((necklace_groups_info[l].object.visible==true)?false:true);
                                }
                            }                         
                       }                            
                    };
                    necklace_groups[display_necklace].add(param, necklace_groups_param[i]).name(necklace_groups_param[i]);
                }
                let param={};
                param['Reset']=function(){reset_design_fn("Necklace")};
                necklace_groups[display_necklace].add(param,'Reset').name('Reset');
            }
        };
    /* ------------------------------------- Necklace Groups - End ---------------------------- */ 

    /* ------------------------------------- Change Pendent Designs - Start ---------------------------- */
	    const material_design_fn =(material_name)=>{
            if(change_material_props.type.localeCompare("Pendent")==0)
            {	  
				change_material_props.object.material=material_design[material_name][0];
            }
            else if(change_material_props.type.localeCompare("Necklace")==0)
            {                    
                if(change_material_props.name.localeCompare("necklace_pendent")==0)
                {
                    for(let l=0;l<necklace_groups_info.length;l++)
                    {
                        if(necklace_groups_info[l].child_name.localeCompare('necklace_pendent')==0)
                        {                  
                            necklace_groups_info[l].object.material=material_design[material_name][0];                            
                        }                         
                    } 
                }
                else if(change_material_props.name.localeCompare("beads")==0)
                {                 
                    for(let l=0;l<necklace_groups_info.length;l++)
                    {
                        if(necklace_groups_info[l].child_name.localeCompare('beads')==0)
                        { 
                            necklace_groups_info[l].object.geometry=mergeBufferGeometries.mergeBufferGeometries(material_assets_geo[material_name],true);                            
                            necklace_groups_info[l].object.material=material_design[material_name][0];                            
                            necklace_groups_info[l].object.scale.set(material_assets[material_name].scale.x,material_assets[material_name].scale.y,material_assets[material_name].scale.z);
                            necklace_groups_info[l].object.rotation.set(material_assets[material_name].rotation.x,material_assets[material_name].rotation.y,material_assets[material_name].rotation.z);
                        }                         
                    }                
                }
            }
	    };
        const reset_design_fn =(type)=>{
            if(type.localeCompare("Pendent")==0)
            {
                for(let i=0;i<pendent_groups_name[display_pendent].length;i++)
                {
                    pendent_groups_name[display_pendent][i].object.material=material_design_config[display_pendent][pendent_groups_name[display_pendent][i].child_name];
                }
            }  
            else if(type.localeCompare("Necklace")==0)
            {
                for(let l=0;l<Necklace_Types[display_necklace].group_names.length;l++)
                {
                    for(let i=0;i<necklace_groups_info.length;i++)
                    {
                        if(necklace_groups_info[i].child_name.localeCompare('necklace_pendent')==0)
                        {                  
                            necklace_groups_info[i].object.material=material_design[necklace_groups_info[i].type];                            
                        }                         
                    }                    
                }
            }         
        };
    /* ------------------------------------- Change Pendent Designs - End ---------------------------------- */

        const load_sub_fn1 = (obj,count) =>{
                loader.load( obj[count].glb, function ( gltf ) {                            
                                gltf.scene.traverse( function ( child ) {                                
                                    if ( child.isMesh ) {                                   
                                      necklace_chain_formation[count]={"geo":child.geometry,"type":obj[count].type,"name":obj[count].name,"render":obj[count].render,"direction":((typeof obj[count].direction!="undefined")?obj[count].direction:"")};                                        
                                    }
                                });                                                    
                                  if((Object.keys(obj).length-1)==count)
                                  {
                                    ready_object_material(necklace_chain_formation);
                                  }
                                  else
                                  {
                                    count++;
                                    load_sub_fn2(obj,count);  
                                  }                                                                                                                                                                                                        
                            },                      
                            function ( xhr ) {
                                if( (xhr.loaded / xhr.total * 100 )==100 )
                                {                      
                                }
                            },                      
                            function ( error ) {
                                console.log( 'An error happened' );
                            }
                );
        };

        const load_sub_fn2 = (obj,count) =>{
                loader.load( obj[count].glb, function ( gltf ) {                            
                                gltf.scene.traverse( function ( child ) {                                
                                    if ( child.isMesh ) {                                   
                                      necklace_chain_formation[count]={"geo":child.geometry,"type":obj[count].type,"name":obj[count].name,"render":obj[count].render,"direction":((typeof obj[count].direction!="undefined")?obj[count].direction:"")};   

                                    }
                                });                                                    
                                  if((Object.keys(obj).length-1)==count)
                                  {
                                    ready_object_material(necklace_chain_formation);
                                  }
                                  else
                                  {
                                    count++;
                                    load_sub_fn1(obj,count);  
                                  }
                            },                      
                            function ( xhr ) {
                                if( (xhr.loaded / xhr.total * 100 )==100 )
                                {                                    
                                }
                            },                      
                            function ( error ) {
                                console.log( 'An error happened' );
                            }
                );
        };
        const load_necklace_object =(beadsObj)=>{           
            beadsObj=JSON.parse(beadsObj);
            load_sub_fn1(beadsObj,0);         
        };   

        const ready_object_material = (object_array) =>{
            let render_object={},render_object1={};
            necklace_groups_info=[];

            let inc1=0,inc2=0;

            for(let inc=0;inc<(Object.keys(object_array).length);inc++)
            {
                if(object_array[inc].render.localeCompare('chain')==0)
                {
                    render_object[inc1]={
                        "geo":mergeBufferGeometries.mergeBufferGeometries([object_array[inc].geo],true),
                        "mat":material_design[object_array[inc].type],
                        "type":object_array[inc].type,
                        "render":object_array[inc].render,
                        "group_name":((object_array[inc].type.localeCompare("blackbeads")==0)?Necklace_Types[display_necklace].group_names[0]:"chain"),                       
                        "common_name":display_necklace
                    };
                    inc1++;
                }
                else
                {
                    render_object1[inc2]={0:{
                        "geo":mergeBufferGeometries.mergeBufferGeometries([object_array[inc].geo],true),
                        "mat":material_design[object_array[inc].type],
                        "type":object_array[inc].type,
                        "render":object_array[inc].render,
                        "group_name":Necklace_Types[display_necklace].group_names[1],
                        "common_name":display_necklace,
                        "direction":object_array[inc].direction                        
                    }};
                    inc2++;                    
                }
            }
                        

            let x_axis="";
            if(typeof Necklace_Types[display_necklace]['repeat_render'].chain.repeat!="undefined")
            {                
                for(let n=0;n<Necklace_Types[display_necklace]['repeat_render'].chain.repeat.length;n++)
                {                
                    render_necklace_fn(render_object,'chain',Necklace_Types[display_necklace]['repeat_render'].chain.repeat[n]);                        
                }
            }
            else
            {
                render_necklace_fn(render_object,'chain',x_axis);
            }

            x_axis="";
            if(typeof Necklace_Types[display_necklace]['repeat_render'].necklacependent.repeat!="undefined")
            {              
                for(let n=0;n<Necklace_Types[display_necklace]['repeat_render'].necklacependent.repeat.length;n++)
                {            
                    render_necklace_fn(render_object1[n],'necklacependent',Necklace_Types[display_necklace]['repeat_render'].necklacependent.repeat[n]);                        
                }
            }
            else
            {
                render_necklace_fn(render_object1,'necklacependent',x_axis);
            }    
                        
        };      

        const render_necklace_fn =(render_object,type,x_axis)=>
        {   
                let stop=Necklace_Types[display_necklace]['repeat_render'][type].stop.enable;
                let chain_stop_mode=(JSON.stringify(Necklace_Types[display_necklace]['repeat_render'][type].repeat)==JSON.stringify(Necklace_Types[display_necklace]['repeat_render'][type].stop.x));
                let rigid_body_arr=[];
                let pos1 = {x: ((x_axis=="")?Necklace_Types[display_necklace][render_object[0].type].position.x:x_axis), y: Necklace_Types[display_necklace][render_object[0].type].position.y, z: Necklace_Types[display_necklace][render_object[0].type].position.z}; 
                let radius = 2;
                let scale = {x: 2, y: 2, z: 2};
                let scaleo = {x: Necklace_Types[display_necklace][render_object[0].type].scale.x, y: Necklace_Types[display_necklace][render_object[0].type].scale.y, z: Necklace_Types[display_necklace][render_object[0].type].scale.z};
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass1 = 0;
                let mass2 = 1;
                let rot={x:Necklace_Types[display_necklace][render_object[0].type].rotation.x,y:Necklace_Types[display_necklace][render_object[0].type].rotation.y,z:Necklace_Types[display_necklace][render_object[0].type].rotation.z};

                let transform = new Ammo.btTransform();

                //Sphere Graphics
                let ball = new THREE.Mesh(render_object[0].geo, render_object[0].mat);
                ball.position.set(pos1.x, pos1.y, pos1.z);                
                ball.scale.set(scaleo.x,scaleo.y,scaleo.z);         
                ball.rotation.set(rot.x,rot.y,rot.z);
                ball.visible=false;
                ball.name=render_object[0].common_name;                
                scene.add(ball);

                //Sphere Physics
                transform.setIdentity();
                transform.setOrigin( new Ammo.btVector3( pos1.x, pos1.y, pos1.z ) );
                transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                let motionState = new Ammo.btDefaultMotionState( transform );

                let sphereColShape = new Ammo.btSphereShape( radius );
                sphereColShape.setMargin( 0.05 );

                let localInertia = new Ammo.btVector3( 0, 0, 0 );
                sphereColShape.calculateLocalInertia( mass1, localInertia );

                let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass1, motionState, sphereColShape, localInertia );
                let sphereBody = new Ammo.btRigidBody( rbInfo );

                physicsWorld.addRigidBody( sphereBody, colGroupGreenBall, colGroupRedBall );

                ball.userData.physicsBody = sphereBody;
                if(type.localeCompare("chain")==0)
                {
                    rigidBodies_chain.push(ball);
                }
                else
                {
                    rigidBodies_necklacependent.push(ball);
                }

                //Create Joints
                let spherePivot = new Ammo.btVector3( 0, - radius, 0 );                
                let blockPivot = new Ammo.btVector3(- scale.x * 0.5,0.1,1 );           
               
                let y1=Necklace_Types[display_necklace][render_object[0].type].position.y;
                
                rigid_body_arr.push(sphereBody);

                for(let x=0;x<Necklace_Types[display_necklace]['repeat_render'][type].count;x++)
                {  
                    for(let inc=0;inc<(Object.keys(render_object).length);inc++)
                    {
                        console.log(render_object[inc].direction);
                        y1=y1-5; 
                        let pos_1 = {x:((x_axis=="")?Necklace_Types[display_necklace][render_object[inc].type].position.x:x_axis), y: y1, z: 0};

                        let block2 = new THREE.Mesh(render_object[inc].geo, render_object[inc].mat);
                        if(stop && ((x)==(Necklace_Types[display_necklace]['repeat_render'][type].count-1)))
                        {
                            pos_1.x=((chain_stop_mode==true)?x_axis:Necklace_Types[display_necklace]['repeat_render'][type].stop.x);
                            pos_1.y=Necklace_Types[display_necklace]['repeat_render'][type].stop.y;
                            mass2=Necklace_Types[display_necklace]['repeat_render'][type].stop.mass;
                            block2.visible=false;
                        }
                        block2.position.set(pos_1.x, pos_1.y, pos_1.z);              
                        block2.scale.set(Necklace_Types[display_necklace][render_object[inc].type].scale.x,Necklace_Types[display_necklace][render_object[inc].type].scale.y,Necklace_Types[display_necklace][render_object[inc].type].scale.z);                                                  
                        if(typeof render_object[inc].direction!="undefined")
                        {                       
                            if(render_object[inc].direction.localeCompare("right")==0)
                            {
                                block2.rotation.set(Necklace_Types[display_necklace][render_object[inc].type].rotation.x,-Necklace_Types[display_necklace][render_object[inc].type].rotation.y,-Necklace_Types[display_necklace][render_object[inc].type].rotation.z);
                            }
                            else
                            {
                                block2.rotation.set(Necklace_Types[display_necklace][render_object[inc].type].rotation.x,Necklace_Types[display_necklace][render_object[inc].type].rotation.y,Necklace_Types[display_necklace][render_object[inc].type].rotation.z);
                            }                           
                        }
                        else
                        {
                            block2.rotation.set(Necklace_Types[display_necklace][render_object[inc].type].rotation.x,Necklace_Types[display_necklace][render_object[inc].type].rotation.y,Necklace_Types[display_necklace][render_object[inc].type].rotation.z);
                        }
                        block2.name=render_object[inc].common_name;
                        block2.group_name=render_object[inc].group_name;                         
                        necklace_groups_info.push({"child_name":block2.group_name,"type":render_object[inc].type,"object":block2,"stop":((block2.visible==false)?"stop":"")});                       
                        scene.add(block2);


                        /*Chain Physics*/
                        transform.setIdentity();
                        transform.setOrigin( new Ammo.btVector3( pos_1.x, pos_1.y, pos_1.z ) );
                        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                        motionState = new Ammo.btDefaultMotionState( transform );

                        let blockColShape2 = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
                        blockColShape2.setMargin( 0.05 );

                        localInertia = new Ammo.btVector3( 0, 0, 0 );
                        blockColShape2.calculateLocalInertia( mass2, localInertia );

                        rbInfo = new Ammo.btRigidBodyConstructionInfo( mass2, motionState, blockColShape2, localInertia );
                        let blockBody2 = new Ammo.btRigidBody( rbInfo );

                        physicsWorld.addRigidBody( blockBody2, colGroupGreenBall, colGroupRedBall );
                        
                        block2.userData.physicsBody = blockBody2;                        
                        if(type.localeCompare("chain")==0)
                        {
                            rigidBodies_chain.push(block2);
                        }
                        else
                        {
                            rigidBodies_necklacependent.push(block2);
                        }
                        rigid_body_arr.push(blockBody2);
                    }            
                }

                for(var l=0;l<rigid_body_arr.length-1;l++)
                {
                    if(l==rigid_body_arr.length-2)
                    {                       
                        let spherePivot,blockPivot; 
                        spherePivot= new Ammo.btVector3(0, -radius, 0 );
                        blockPivot = new Ammo.btVector3( - scale.x * 0.05, -1, 1 );
                        let p2p3 = new Ammo.btPoint2PointConstraint( rigid_body_arr[l],rigid_body_arr[l+1], spherePivot, blockPivot);
                        physicsWorld.addConstraint( p2p3, false );
                    }
                    else
                    {
                    let p2p3 = new Ammo.btPoint2PointConstraint( rigid_body_arr[l],rigid_body_arr[l+1], spherePivot, blockPivot);
                    physicsWorld.addConstraint( p2p3, false );
                    }                                        
                }
        };


        const updatePhysics = ( deltaTime ) =>{              
                physicsWorld.stepSimulation( deltaTime,10 );
                
                 /*chain simulation*/
                for ( let i = 0; i < rigidBodies_chain.length; i++ ) {
                    let objThree = rigidBodies_chain[ i ];
                    let objAmmo = objThree.userData.physicsBody;
                    let ms = objAmmo.getMotionState();
                    if ( ms ) {
                        ms.getWorldTransform( tmpTrans );
                        let p = tmpTrans.getOrigin();
                        let q = tmpTrans.getRotation();
                        objThree.position.set(p.x()*0.1, p.y()*0.3, 0 );                                                
                    }
                }
                /*peacock & pendent simulation*/
                for ( let i = 0; i < rigidBodies_necklacependent.length; i++ ) {
                    let objThree = rigidBodies_necklacependent[ i ];
                    let objAmmo = objThree.userData.physicsBody;
                    let ms = objAmmo.getMotionState();
                    if ( ms ) {
                        ms.getWorldTransform( tmpTrans );
                        let p = tmpTrans.getOrigin();
                        let q = tmpTrans.getRotation();
                        objThree.position.set(p.x(), p.y(), 0 );
                    }
                }
        };

    /*----------------------------------Document ready function UI-functionality-------------------------------*/
    		$(document).ready(function(){               

    			$(".pendents").click(function(){
    				render_pendent_fn($(this).attr('data-pendentType'),$(this).attr('data-pendentModel'));
    			});
                $(".necklaces").click(function(){
                    display_necklace=$(this).attr('data-necklaceType');
                    if(display_necklace.localeCompare("Necklace_Type_1")==0)
                    {
                        render_necklace_groups(Necklace_Types[display_necklace].group_names);
                        load_necklace_object($(this).attr('data-necklaceObj'));
                        setTimeout(function(){physics_stop=false;}, 10000); 
                    }
                    else
                    {
                        let test_geo="";
                        loader.load( 'a7.glb', function ( gltf ) {                            
                                gltf.scene.traverse( function ( child ) {                   
                                    if ( child.isMesh ) {
                                          test_geo=child.geometry;                                                                                     
                                    }
                                });
                                console.log(test_geo)

                                for(let i=0;i<necklace_groups_info.length;i++)
                                {
                                    if(necklace_groups_info[i].child_name.localeCompare('necklace_pendent')==0)
                                    {                          
                                        necklace_groups_info[i].object.geometry=mergeBufferGeometries.mergeBufferGeometries([test_geo],true);                            
                                        necklace_groups_info[i].object.material=material_design['peacock'][0];                            
                                        necklace_groups_info[i].object.scale.set(Necklace_Types.Necklace_Type_2.necklacependent.scale.x,Necklace_Types.Necklace_Type_2.necklacependent.scale.y,Necklace_Types.Necklace_Type_2.necklacependent.scale.z);
                                        necklace_groups_info[i].object.rotation.set(Necklace_Types.Necklace_Type_2.necklacependent.rotation.x,Necklace_Types.Necklace_Type_2.necklacependent.rotation.y,Necklace_Types.Necklace_Type_2.necklacependent.rotation.z);                           
                                    }                         
                                }                                                         
                            },                      
                            function ( xhr ) {
                                if( (xhr.loaded / xhr.total * 100 )==100 )
                                {                         
                                }
                            },                      
                            function ( error ) {
                                console.log( 'An error happened' );
                            }
                        );
                           
                    }
                });
    		});
    /*----------------------------------Document ready function UI-functionality-------------------------------*/


  
            