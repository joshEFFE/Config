/*-------------------------------- Pendent Types - Configration start ----------------------------------------*/

let Pendent_Types={

	Pendent_Type_1:{
		position	: 	{
			"x":-10,
			"y":2.5,
			"z":0
		},
		scale		: 	{
			"x":200,
			"y":200,
			"z":200
		},
		rotation	: 	{
			"x":Math.PI * 0.5,
			"y":0,
			"z":0
		}
	},
	Pendent_Type_2:{
		position	: 	{
			"x":0,
			"y":5,
			"z":3
		},
		scale		: 	{
			"x":20,
			"y":20,
			"z":20
		},
		rotation	: 	{
			"x":Math.PI * 0.5,
			"y":0,
			"z":0
		}
	},
	Pendent_Type_3:{
		position	: 	{
			"x":0,
			"y":30,
			"z":3
		},
		scale		: 	{
			"x":4,
			"y":4,
			"z":4
		},
		rotation	: 	{
			"x":0,
			"y":0,
			"z":0
		}
	},
};

/*--------------------------------- Pendent Types - Configration end -----------------------------------------*/

/*--------------------------------- Material Assets - Configration Start ---------------------------------*/
let material_assets={
	blackbeads:{
			scale		: 	{
				"x":0.1,
				"y":0.1,
				"z":0.1
			},
			rotation	: 	{
				"x":-0.003533345380547474,
				"y":-0.15513053056548087,
				"z":1.3364096963448624
			}
	},
	emarald:{
			scale		: 	{
				"x":0.04,
				"y":0.04,
				"z":0.04
			},
			rotation	: 	{
				"x":-0.018634362619458375,
				"y":0.05809195913560703,
				"z":0.620662154508949
			}
	},
	ruby:{
			scale		: 	{
				"x":0.04,
				"y":0.04,
				"z":0.04
			},
			rotation	: 	{
				"x":-0.018634362619458375,
				"y":0.05809195913560703,
				"z":0.620662154508949
			}
	},
	pearls:{
			scale		: 	{
				"x":0.05,
				"y":0.05,
				"z":0.05
			},
			rotation	: 	{
				"x":0,
				"y":0,
				"z":0
			}
	}
};
/*--------------------------------- Material Assets - Configration End -----------------------------------*/

/*--------------------------------- Necklace Types - Configration Start -----------------------------------------*/

let Necklace_Types={
	Necklace_Type_1:{
		group_names:['beads','necklace_pendent'],
		chain:{
			position	: 	{
				"x":-320,
				"y":150,
				"z":0
			},
			scale		: 	{
				"x":0.1,
				"y":0.1,
				"z":0.1
			},
			rotation	: 	{
				"x":-0.012929201841282635,
				"y":0.04915456794055888,
				"z":0.5143188657194
			}
		},
		blackbeads:{
			position	: 	{
				"x":-320,
				"y":150,
				"z":0
			},			
			scale		: 	{
				"x":0.1,
				"y":0.1,
				"z":0.1
			},
			rotation	: 	{
				"x":-0.003533345380547474,
				"y":-0.15513053056548087,
				"z":1.3364096963448624
			}
		},
		peacock:{
			position	: 	{
				"x":-30,
				"y":25,
				"z":0
			},			
			scale		: 	{
				"x":0.2,
				"y":0.2,
				"z":0.2
			},
			rotation	: 	{
				"x":Math.PI * 0.5,
				"y":0,
				"z":0
			}
		},
		repeat_render:{
			chain	: {
				count:14,
				stop:{
			        enable:true,
			        x:[-320,-300,-280,120,100,80],
					y:80,
					mass:0					
				},
				repeat:[-320,-300,-280,120,100,80]			
			},
			necklacependent	: {
				count:12,
				stop:{
			        enable:true,
					x:-10,
					y:5,
					mass:0
				},
				repeat:[-30,10]	
			}
		}
	},
	Necklace_Type_2:{
		necklacependent	: {					
			scale		: 	{
				"x":0.27,
				"y":0.27,
				"z":0.27
			},
			rotation	: 	{
				"x":-3.0706362818930746,
				"y":0,
				"z":-0
			}
		}
	}
};



/*---------------------------------- Necklace Types - Configration End ------------------------------------------*/