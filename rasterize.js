/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var colorBuffer; // this contains values for each triangle in triples
var triBufferSize = 0; // the number of indices in the triangle buffer
var colBufferSize = 0; // number of color values in the color buffer
var vertexPositionAttrib; // where to put position for vertex shader
var vertexColorAttrib; // the color to use for vertex shader

/* custom globals */
var showCustom = false;

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL, "triangles");
    var inputTriangles_custom = [
        // pink
        {
            "material": { "ambient": [0.915, 0.676, 0.425], "diffuse": [0.725, 0.560, 0.235], "specular": [0.15, 0.15, 0.15], "n": 6 },
            "vertices": [
                [-1, 1, 0.5], [1, 1, 0.5], [1, -1, 0.5], [-1, -1, 0.5]


            ],
            "triangles": [[0, 1, 3], [3, 1, 2]]
        },
        // dark pink
        //{
        //    "material": { "ambient": [0.851, 0.514, 0.349], "diffuse": [0.851, 0.514, 0.349], "specular": [0.15, 0.15, 0.15], "n": 10 },
        //    "vertices": [
        //        [-1, 0.12, 0.5], [1.5, 0.22, 0.5], [1.0, -1.5, 0.0],

        //    ],
        //    "triangles": [[0, 1, 2]]
        //},
        //// darker pink
        //{
        //    "material": { "ambient": [0.780, 0.353, 0.263], "diffuse": [0.780, 0.353, 0.263], "specular": [0.1, 0.1, 0.1], "n": 6 },
        //    "vertices": [
        //        [0.53, 0.29, 0.29], [0.85, 0.29, 0.29], [0.68, 0.25, 0.29],
        //        [0.52, 0.13, 0.29], [0.53, 0.29, 0.29], [0.58, 0.30, 0.29],
        //        [0.65, 0.25, 0.29], [0.70, 0.26, 0.29], [0.68, 0.096, 0.29],
        //        [0.70, 0.29, 0.29], [0.74, 0.30, 0.29], [0.75, 0.13, 0.29],
        //        [0.80, 0.29, 0.29], [0.85, 0.29, 0.29], [0.88, 0.12, 0.29],
        //        [0.73, 0.29, 0.29], [0.73, 0.58, 0.29], [0.90, 0.58, 0.29], [0.85, 0.29, 0.29]

        //    ],
        //    "triangles": [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [15, 17, 18]]
        //},
        // white 1
        {
            "material": { "ambient": [0.941, 0.808, 0.412], "diffuse": [0.941, 0.808, 0.412], "specular": [0.25, 0.25, 0.25], "n": 5 },
            "vertices": [
                [0.25, -0.34, -0.07], [0.18, -0.12, -0.07], [0.25, -0.03, -0.07], [0.22, -0.0, -0.07], [0.43, 0.01, -0.07], [0.4, -0.06, -0.07], [0.44, -0.19, -0.07], [0.39, -0.36, -0.07],
                [0.62, -0.39, -0.07], [0.6, -0.26, -0.07], [0.83, -0.32, -0.07], [0.76, -0.41, -0.07],
                [0.8, -0.33, -0.07], [0.87, -0.34, -0.07], [0.76, -0.4, -0.07], [0.84, -0.347, -0.07], 
                [0.57, -0.37, -0.08], [0.81, -0.4, -0.08], [0.68, -0.44, -0.08],
                [-0.7915, 0.34, -0.05], [-0.6835, 0.66, -0.05], [-0.6655, 0.74, -0.05], [-0.4045, 0.8, -0.05], [-0.3235, 0.66, -0.05], [-0.1255, 0.49, -0.05],
                [0.15527, 0.69616, -0.06], [0.015202, 1.1637, -0.06], [0.93531, 1.3498, -0.06], [0.97657, 0.8933, -0.06]
                
            ],
            "triangles": [[0, 1, 6], [0, 6, 7], [1, 2, 5], [1,5, 6], [3, 4, 5], [3, 5, 6], [8, 9, 10], [8, 10, 11], [12, 13, 15], [14, 15, 13], [16, 17, 18], [19, 20, 23], [19,23, 24], [20, 21, 22], [20, 22, 23], [25, 26, 27], [25, 27, 28]]
        },
        // greeny 1
        {
            "material": { "ambient": [0.804, 0.675, 0.286], "diffuse": [0.804, 0.675, 0.286], "specular": [0.15, 0.15, 0.15], "n": 4 },
            "vertices": [
                [0.3946, 0.23, -0.07], [0.4246, 0.34, -0.07], [0.5046, 0.31, -0.07], [0.5246, 0.22, -0.07],
                [0.3246, -0.25, -0.06], [0.4346, 0.14, -0.06], [0.4446, 0.25, -0.06], [0.4746, 0.23, -0.06],
                [0.3246, 0.05, -0.06], [0.3846, 0.09, -0.06], [0.4046, 0.01, -0.06],
                [0.4146, 0.04, -0.06], [0.4646, 0.09, -0.06], [0.4846, 0.03, -0.06],

                
            ],
            "triangles": [[0, 1, 3], [3, 1, 2], [4, 5, 7], [5, 6, 7], [8, 9, 10], [11, 12, 13]]
        },
        // cyan
        {
            "material": { "ambient": [0.263, 0.467, 0.325], "diffuse": [0.790, 0.353, 0.263], "specular": [0.25, 0.25, 0.25], "n": 6 },
            "vertices": [
                [-1.5, -0.75, 0.16], [1.5, -0.77, 0.16], [0.0, -1.5, 0.16],
                [0.3346, 0.16, -0.05], [0.2746, 0.3, -0.05], [0.5746, 0.3, -0.05],
                [0.3146, 0.38, -0.05], [0.4146, 0.46, -0.05], [0.5246, 0.22, -0.05],
                [0.3946, 0.23, -0.05], [0.5446, 0.4, -0.05], [0.6146, 0.22, -0.05],
                [0.4846, 0.11, -0.05], [0.4246, 0.32, -0.05], [0.5946, 0.15, -0.05],
                [0.61346, -0.34746, -0.08], [0.60654, -0.30254, -0.08], [0.809, -0.347, -0.08], [0.781, -0.383, -0.08],
                [-0.80138, -0.48427, -0.07], [-0.77291, -0.4699, -0.07], [-0.7125, -0.47938, -0.07]
     

            ],
            "triangles": [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [15, 17, 18], [19, 20 ,21]]
        },
        // brown
        {
            "material": { "ambient": [0.275, 0.099, 0.106], "diffuse": [0.275, 0.099, 0.106], "specular": [0, 0, 0], "n": 5 },
            "vertices": [
                [0.13, -0.32, -0.1], [0.89, -0.42, -0.1], [0.91, -0.46, -0.1], [0.11, -0.4, -0.1],
                [0.15, -0.4, -0.09], [0.31, -0.41, -0.09], [0.23, -0.84, -0.09],
                [0.64, -0.43, -0.09], [0.75, -0.44, -0.09], [0.89, -0.89, -0.09],
                [0.27, -0.4, 0.1], [0.36, -0.41, 0.1], [0.33, -0.79, 0.1],
                [0.67, -0.43, 0.1], [0.74, -0.44, 0.1], [0.66, -0.81, 0.1],
                [-1.09, -0.83, -0.05], [-1.08, -0.47, -0.05], [-0.6735, -0.44, -0.05], [-0.6835, -0.54, -0.05], [-0.623, -0.84, -0.05],
                [0.099953, 0.6296, -0.05], [-0.044748, 1.2075, -0.05], [0.9774, 1.4153, -0.05], [1.0565, 0.83999, -0.05]
            ],
            "triangles": [[0, 1, 3], [3, 1, 2], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13,14,15], [16, 17, 19], [16, 19, 20], [17, 18, 19], [21, 22, 23], [21, 23, 24]]
        },
        //// white 2
        //{
        //    "material": { "ambient": [0.941, 0.808, 0.412], "diffuse": [0.941, 0.808, 0.412], "specular": [0.25, 0.25, 0.25], "n": 4 },
        //    "vertices": [
        //        [0.43, 0.43, 0.26], [0.53, 0.61, 0.25], [0.61, 0.54, 0.25],
        //        [0.96, 0.56, 0.26], [0.86, 0.52, 0.26], [0.78, 0.45, 0.25], [0.89, 0.42, 0.25],
        //        [0.608, 0.642, 0.26], [0.619, 0.661, 0.26], [0.642, 0.661, 0.26],
        //        [0.668, 0.668, 0.26], [0.684, 0.681, 0.26], [0.704, 0.674, 0.26],
        //        [0.621, 0.61, 0.26], [0.707, 0.604, 0.26], [0.665, 0.584, 0.26]
        //    ],
        //    "triangles": [[0, 1, 2], [4, 3, 6], [4, 6, 5], [7, 8, 9], [10, 11, 12], [13, 14, 15]]
        //},
        //// boarder
        //{
        //    "material": { "ambient": [0.314, 0.149, 0.125], "diffuse": [0.314, 0.149, 0.125], "specular": [0.0, 0.0, 0.0], "n": 5 },
        //    "vertices": [
        //        [0.05, 0.95, 0.06], [0.95, 0.95, 0.06], [0.85, 0.86, 0.06], [0.148, 0.85, 0.06],
        //        [0.05, 0.05, 0.06], [0.153, 0.149, 0.06], [0.854, 0.15, 0.06], [0.95, 0.05, 0.06]
        //    ],
        //    "triangles": [[0, 1, 2], [0, 2, 3], [4, 5, 6], [4, 6, 7], [4, 5, 0], [0, 3, 5], [1, 2, 6], [6, 1, 7]]
        //},
        //// boarder 2
        //{
        //    "material": { "ambient": [1, 1, 1], "diffuse": [0.715, 0.500, 0.185], "specular": [0.0, 0.0, 0.0], "n": 5 },
        //    "vertices": [
        //        [-1.5, -0.71, 0.16], [1.5, -0.70, 0.16], [0.0, -1.5, 0.16]
        //    ],
        //    "triangles": [[0, 1, 2]]
        //},
        // greeny 2
        {
            "material": { "ambient": [0.745, 0.580, 0.255], "diffuse": [0.804, 0.675, 0.286], "specular": [0.15, 0.15, 0.15], "n": 5 },
            "vertices": [
                [-0.44, -0.79, 0.0], [-0.18, -0.7, 0.0], [0.08, -0.8, 0.0],
                [-0.24, -0.73, 0.0], [-0.107, 0.08, 0.0], [-0.251, -0.11, 0.0], [-0.467, 0.41, 0.0], [-0.53, 0.45, 0.0], [-0.251, -0.2, 0.0], [-0.0805, 0.07, 0.0], [-0.125, -0.73, 0.0],
                [-0.617, 0.35, 0.0], [-0.602, 0.31, 0.0], [-0.612, 0.27, 0.0],
                [-0.613, 0.216, 0.0], [-0.6, 0.256, 0.0], [-0.603, 0.177, 0.0],
                [-0.613, 0.146, 0.0], [-0.6026, 0.107, 0.0], [-0.6135, 0.0665, 0.0],
                [-0.6655, -0.05, 0.0], [-0.6034, 0.04, 0.0], [-0.5755, -0.06, 0.0]

            ],
            "triangles": [[0, 1, 2], [3, 4, 9], [3, 9, 10], [4, 5, 9], [5, 9, 8], [5, 6, 7], [7, 5, 8], [11, 12, 13], [14, 15, 16], [17, 18, 19], [20, 21, 22]]
        }

    ];
    //var inputTriangles_custom = [
    //    // pink
    //    {
    //        "material": { "ambient": [0.945, 0.706, 0.455], "diffuse": [0.945, 0.706, 0.455], "specular": [0.15, 0.15, 0.15], "n": 6 },
    //        "vertices": [
    //            [-2.25, -2.25, 0.5], [-2.25, 4.25, 0.5], [5.25, 3.0, 0.5]


    //        ],
    //        "triangles": [[0, 1, 2]]
    //    },
    //    // dark pink
    //    {
    //        "material": { "ambient": [0.851, 0.514, 0.349], "diffuse": [0.851, 0.514, 0.349], "specular": [0.15, 0.15, 0.15], "n": 10 },
    //        "vertices": [
    //            [-1, 0.12, 0.5], [1.5, 0.22, 0.5], [1.0, -1.5, 0.0],

    //        ],
    //        "triangles": [[0, 1, 2]]
    //    },
    //    // darker pink
    //    {
    //        "material": { "ambient": [0.780, 0.353, 0.263], "diffuse": [0.780, 0.353, 0.263], "specular": [0.1, 0.1, 0.1], "n": 6 },
    //        "vertices": [
    //            [0.53, 0.29, 0.29], [0.85, 0.29, 0.29], [0.68, 0.25, 0.29],
    //            [0.52, 0.13, 0.29], [0.53, 0.29, 0.29], [0.58, 0.30, 0.29],
    //            [0.65, 0.25, 0.29], [0.70, 0.26, 0.29], [0.68, 0.096, 0.29],
    //            [0.70, 0.29, 0.29], [0.74, 0.30, 0.29], [0.75, 0.13, 0.29],
    //            [0.80, 0.29, 0.29], [0.85, 0.29, 0.29], [0.88, 0.12, 0.29],
    //            [0.73, 0.29, 0.29], [0.73, 0.58, 0.29], [0.90, 0.58, 0.29], [0.85, 0.29, 0.29]

    //        ],
    //        "triangles": [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [15, 17, 18]]
    //    },
    //    // white 1
    //    {
    //        "material": { "ambient": [0.941, 0.808, 0.412], "diffuse": [0.941, 0.808, 0.412], "specular": [0.25, 0.25, 0.25], "n": 5 },
    //        "vertices": [
    //            [0.43, 0.43, 0.26], [0.53, 0.61, 0.25], [0.61, 0.54, 0.25],
    //            [0.43, 0.43, 0.26], [0.62, 0.56, 0.28], [0.65, 0.48, 0.28],
    //            [0.58, 0.54, 0.28], [0.77, 0.63, 0.28], [0.80, 0.35, 0.28],
    //            [0.59, 0.37, 0.27], [0.80, 0.56, 0.28], [0.84, 0.35, 0.27],
    //            [0.77, 0.53, 0.27], [0.77, 0.63, 0.28], [0.96, 0.56, 0.26], [0.86, 0.52, 0.26]
    //        ],
    //        "triangles": [[3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 15], [13, 14, 15]]
    //    },
    //    // greeny 1
    //    {
    //        "material": { "ambient": [0.804, 0.675, 0.286], "diffuse": [0.804, 0.675, 0.286], "specular": [0.15, 0.15, 0.15], "n": 4 },
    //        "vertices": [
    //            [0.58, 0.71, 0.27], [0.63, 0.56, 0.25], [0.72, 0.59, 0.25], [0.7, 0.74, 0.27],
    //            [0.56, 0.68, 0.26], [0.54, 0.52, 0.26], [0.63, 0.55, 0.26],
    //            [0.8, 0.45, 0.26], [0.88, 0.51, 0.26], [0.87, 0.35, 0.26],
    //            [0.1, 0.85, 0.275], [0.28, 0.14, 0.28], [0.14, 0.84, 0.28], [0.30, 0.14, 0.28],
    //            [0.12, 0.09, 0.27], [0.28, 0.19, 0.27], [0.44, 0.09, 0.27]
    //        ],
    //        "triangles": [[1, 0, 2], [0, 3, 2], [5, 4, 6], [7, 8, 9], [11, 10, 12], [11, 12, 13], [14, 15, 16]]
    //    },
    //    // cyan
    //    {
    //        "material": { "ambient": [0.263, 0.467, 0.325], "diffuse": [0.263, 0.467, 0.325], "specular": [0.25, 0.25, 0.25], "n": 6 },
    //        "vertices": [
    //            [0.58, 0.37, 0.25], [0.82, 0.36, 0.28], [0.81, 0.29, 0.28], [0.62, 0.25, 0.25],
    //            [0.45, 0.36, 0.22], [0.72, 0.41, 0.20], [0.73, 0.30, 0.20], [0.64, 0.27, 0.20],
    //            [0.54, 0.13, 0.22], [0.58, 0.37, 0.22], [0.65, 0.37, 0.22], [0.68, 0.12, 0.22],
    //            [-0.15, 0.73, 0.26], [0.03, 1.2, 0.28], [0.43, 0.91, 0.24], [0.94, 1.09, 0.28]

    //        ],
    //        "triangles": [[0, 1, 3], [3, 1, 2], [4, 5, 7], [7, 5, 6], [8, 9, 11], [9, 10, 11], [12, 13, 14], [13, 15, 14]]
    //    },
    //    // brown
    //    {
    //        "material": { "ambient": [0.275, 0.099, 0.106], "diffuse": [0.275, 0.099, 0.106], "specular": [0, 0, 0], "n": 5 },
    //        "vertices": [
    //            [0.60, 0.78, 0.285], [0.665, 0.79, 0.285], [0.49, 0.60, 0.285], [0.68, 0.54, 0.285], [0.82, 0.66, 0.285],
    //            [0.57, 0.71, 0.26], [0.63, 0.74, 0.26], [0.6, 0.64, 0.26],
    //            [0.65, 0.74, 0.26], [0.70, 0.75, 0.26], [0.72, 0.66, 0.26],
    //            [0.60, 0.26, 0.18], [0.73, 0.38, 0.18], [0.74, 0.29, 0.18],
    //            [0.51, 0.08, 0.23], [0.65, 0.19, 0.23], [0.66, 0.09, 0.23],
    //            [-0.02, 0.48, 0.25], [0.56, 0.43, 0.25], [0.55, 0.42, 0.25], [-0.04, 0.45, 0.25],
    //            [0.64, 0.79, 0.27], [0.64, 0.84, 0.27], [0.67, 0.85, 0.27]
    //        ],
    //        "triangles": [[0, 2, 4], [1, 2, 4], [2, 3, 4], [5, 6, 7], [8, 9, 10], [11, 12, 13], [14, 15, 16], [17, 18, 19], [17, 20, 19], [21, 22, 23]]
    //    },
    //    // white 2
    //    {
    //        "material": { "ambient": [0.941, 0.808, 0.412], "diffuse": [0.941, 0.808, 0.412], "specular": [0.25, 0.25, 0.25], "n": 4 },
    //        "vertices": [
    //            [0.43, 0.43, 0.26], [0.53, 0.61, 0.25], [0.61, 0.54, 0.25],
    //            [0.96, 0.56, 0.26], [0.86, 0.52, 0.26], [0.78, 0.45, 0.25], [0.89, 0.42, 0.25],
    //            [0.608, 0.642, 0.26], [0.619, 0.661, 0.26], [0.642, 0.661, 0.26],
    //            [0.668, 0.668, 0.26], [0.684, 0.681, 0.26], [0.704, 0.674, 0.26],
    //            [0.621, 0.61, 0.26], [0.707, 0.604, 0.26], [0.665, 0.584, 0.26]
    //        ],
    //        "triangles": [[0, 1, 2], [4, 3, 6], [4, 6, 5], [7, 8, 9], [10, 11, 12], [13, 14, 15]]
    //    },
    //    // boarder
    //    {
    //        "material": { "ambient": [0.314, 0.149, 0.125], "diffuse": [0.314, 0.149, 0.125], "specular": [0.0, 0.0, 0.0], "n": 5 },
    //        "vertices": [
    //            [0.05, 0.95, 0.06], [0.95, 0.95, 0.06], [0.85, 0.86, 0.06], [0.148, 0.85, 0.06],
    //            [0.05, 0.05, 0.06], [0.153, 0.149, 0.06], [0.854, 0.15, 0.06], [0.95, 0.05, 0.06]
    //        ],
    //        "triangles": [[0, 1, 2], [0, 2, 3], [4, 5, 6], [4, 6, 7], [4, 5, 0], [0, 3, 5], [1, 2, 6], [6, 1, 7]]
    //    },
    //    //// boarder 2
    //    //{
    //    //    "material": { "ambient": [1, 1, 1], "diffuse": [1, 1, 1], "specular": [0.0, 0.0, 0.0], "n": 5 },
    //    //    "vertices": [
    //    //        [-0.1, 1.1, 0.01], [1.1, 1.1, 0.01], [0.85, 0.86, 0.01], [0.148, 0.85, 0.01],
    //    //        [-0.1, -0.1, 0.01], [0.153, 0.149, 0.01], [0.854, 0.15, 0.01], [1.1, -0.1, 0.01]
    //    //    ],
    //    //    "triangles": [[0, 1, 2], [0, 2, 3], [4, 5, 6], [4, 6, 7], [4, 5, 0], [0, 3, 5], [1, 2, 6], [6, 1, 7]]
    //    //},
    //    // greeny 2
    //    {
    //        "material": { "ambient": [0.745, 0.580, 0.255], "diffuse": [0.745, 0.580, 0.255], "specular": [0.15, 0.15, 0.15], "n": 5 },
    //        "vertices": [
    //            [0.65, 0.62, 0.25], [0.657, 0.667, 0.25], [0.686, 0.63, 0.25],
    //            [0.65, 0.57, 0.26], [0.71, 0.59, 0.26], [0.69, 0.51, 0.26]

    //        ],
    //        "triangles": [[0, 1, 2], [3, 4, 5]]
    //    }
    //];

    if (showCustom) {
        inputTriangles = inputTriangles_custom;
    }

    if (inputTriangles != String.null) { 
        var whichSetVert;        // index of vertex in current triangle set
        var whichSetTri;         // index of triangle in current triangle set
        var coordArray = [];     // 1D array of vertex coords for WebGL
        var indexArray = [];     // 1D array of vertex indices for WebGL
        var colorArray = [];     // 1D array of RGBA color values for WebGL
        var vtxBufferSize = 0;   // number of vertices in the vertex buffer
        var vtxToAdd = [];       // vtx coords to add to the coord array
        var indexOffset = vec3.create(); // the index offset for the current set
        var triToAdd = vec3.create();    // tri indices to add to the index array
        var colToAdd = vec4.create();    // col value to add to the color array
        
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            // update vertex offset
            vec3.set(indexOffset, vtxBufferSize, vtxBufferSize, vtxBufferSize, vtxBufferSize);

            // set up the vertex coord array
            //console.log("vertex coordArray: ");
            for (whichSetVert = 0; whichSetVert < inputTriangles[whichSet].vertices.length; whichSetVert++){
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                coordArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
                //coordArray = coordArray.concat(vtxToAdd);
                //console.log(inputTriangles[whichSet].vertices[whichSetVert]);
            }

            // set up the triangle index array
            //console.log("triangleIndexArray: ");
            for (whichSetTri = 0; whichSetTri < inputTriangles[whichSet].triangles.length; whichSetTri++) {
                vec3.add(triToAdd, indexOffset, inputTriangles[whichSet].triangles[whichSetTri]);
                indexArray.push(triToAdd[0], triToAdd[1], triToAdd[2]);
                //indexArray = indexArray.concat(triToAdd);
                //console.log(inputTriangles[whichSet].triangles[whichSetTri]);
            }

            // set up the triangle color array
            // adds an instance of the material values for each triangle vertex
            for (whichSetVert = 0; whichSetVert < inputTriangles[whichSet].vertices.length; whichSetVert++) {
                colToAdd = inputTriangles[whichSet].material.diffuse;
                colorArray.push(colToAdd[0], colToAdd[1], colToAdd[2], 1.0);
                //colorArray = colorArray.concat(new vec4.fromValues(colToAdd[0], colToAdd[1], colToAdd[2], 1.0));
                //console.log(inputTriangles[whichSet].material.diffuse);
            }

            vtxBufferSize += inputTriangles[whichSet].vertices.length;
            triBufferSize += inputTriangles[whichSet].triangles.length;
            colBufferSize += inputTriangles[whichSet].triangles.length;
        } // end for each triangle set
        triBufferSize *= 3;
        //colBufferSize *= 4;

        console.log("coordArray.length: " + coordArray.length);
        console.log("indexArray.length: " + indexArray.length);
        console.log("colorArray.length: " + colorArray.length);
        console.log("colorArray: " + colorArray);


        // send the vertex coords to webGL
        vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordArray), gl.STATIC_DRAW); // coords to that buffer

        // send the triangle indices to webGL
        triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW); // indices to that buffer

        // send the triangle colors to webGL
        colorBuffer = gl.createBuffer(); // init empty color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); // activate buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);

    } // end if triangles found
} // end load triangles

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;
        varying vec4 v_color;
        void main(void) {
            gl_FragColor = v_color;
            //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // all fragments are white
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec4 vertexColor;
        varying vec4 v_color;

        void main(void) {
            gl_Position = vec4(vertexPosition, 1.0); // use the untransformed position
            v_color = vertexColor;
        }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)

                vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "vertexPosition"); // get pointer to vertex shader input
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array

                vertexColorAttrib = gl.getAttribLocation(shaderProgram, "vertexColor"); // get pointer to color input
                gl.enableVertexAttribArray(vertexColorAttrib);
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // feed

    // color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); // activate
    gl.vertexAttribPointer(vertexColorAttrib, 4, gl.FLOAT, false, 0, 0); // feed

    // triangle buffer: activate and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate
    gl.drawElements(gl.TRIANGLES, triBufferSize, gl.UNSIGNED_SHORT, 0); // render
    //gl.drawArrays(gl.TRIANGLES, 0, triBufferSize); // render

    
    
} // end render triangles


/**
 * Toggles the shown graphic between 2 versions when 'Space' is pressed
 * @param {any} evt event data
 */
function toggleDisplay(evt) {

    // toggles the showCustom boolean when "Space" is pressed
    if (evt.code == "Space") {
        if (showCustom) {
            showCustom = false;
        }
        else {
            showCustom = true;
        }

        // reset buffer sizes
        triBufferSize = 0;
        colBufferSize = 0;

        setupWebGL(); // set up the webGL environment
        loadTriangles(); // load in the triangles from tri file
        setupShaders(); // setup the webGL shaders
        renderTriangles(); // draw the triangles using webGL
    }
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadTriangles(); // load in the triangles from tri file
  setupShaders(); // setup the webGL shaders
  renderTriangles(); // draw the triangles using webGL

  window.addEventListener("keydown", toggleDisplay, false);

} // end main
