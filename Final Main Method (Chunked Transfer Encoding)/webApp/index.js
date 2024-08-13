//----- filter keys and values
var isPlay = true, 
    filter1 = 100, 
    filter11 = 0,
    picfilter = "original";


//------ image tags on web app
const image1 = document.getElementById("img1");
const image2 = document.getElementById("img2");
const image  = document.getElementById("img");
image.src = "./images/titleLogo.png";

/* Brightness and contrast level */
const maxBrightness = 240,
      minBrightness = 50,
      brightnessIntvl = 5,
      maxContrast = 255,
      minContrast = 0,
      contrastIntvl = 5;



/* zooming paameters */
var zoomLevel = 0;
const minHeight = 180, // 2 2/3 of SD 
      maxHeight = 1080, // FHD 1080p
      pixelDiff = (maxHeight - minHeight) / 9, // 16:9 aspect ratio conservation
      zoomInterval = 1, // magnification control
      zoomMax = pixelDiff/zoomInterval;

    

function reload() {
    if (isPlay) {
        fore_back_filter(picfilter);
    }

    image.style.filter = imgISP(filter1, 150);
}
    

function ISPfunction(option) {
    //---- filter index

    switch (option) {
        case 1:
            console.log("zooom out");
            // getParam = "/zoom";

            zoomLevel = (zoomLevel >= zoomMax)? zoomMax : zoomLevel + 1;
            break;
        
        case 0:
            console.log("zooom in");
            // getParam = "/zoom";

            zoomLevel = (zoomLevel <= 0)? 0 : zoomLevel - 1;
            break;

        case 2:
            console.log("brighten");
            // getParam = "/bright1";

            filter1 = (filter1 >= maxBrightness)? maxBrightness : filter1 + brightnessIntvl;
            break;

        case 3:
            console.log("dim");
            // getParam = "/dim";

            filter1 = (filter1 <= minBrightness)? minBrightness : filter1 - brightnessIntvl;
            break;

        case 4:
            console.log("play");
            isPlay = true;

            image1.src = "http://192.168.137.86/";
            break;

        case 5:
            console.log("pause");
            isPlay = false;

            image1.src = image.src;
            break;
        
        case 6:
            // Change all images to black and white (100% gray):
            picfilter = "bow";
            console.log("black & white");
            break;
        
        case 7:
            picfilter = "nothing";
            console.log("Pal");
            // image.src = baseUrl;
            break;

        case 8:
            // Change all images to black and white (100% gray):
            picfilter = "yobl";
            console.log("yellow on blue");
            break;

        case 9:
            // Change all images to black and white (100% gray):
            picfilter = "rog";
            console.log("red on green");
            break;

        case 10:
            // Change all images to black and white (100% gray):
            picfilter = "boy";
            console.log("black on yellow");
            break;
        

        case 11:
            console.log("set password");
            location.href = "./wifiConfig.html";
            // getParam = "/pass=";
            break;
           
            
        case 12:
            console.log("high contrast");
            // getParam = "/hcontrast";

            filter11 = (filter11 >= maxContrast)? maxContrast : filter11 + contrastIntvl;
            break;


        case 13:
            console.log("low contrast");
            // getParam = "/lcontrast";

            filter11 = (filter11 <= minContrast)? minContrast : filter11 - contrastIntvl;
            break;
    

        default:
            break;
    }

}


function imgISP(brightness, contrast) {
    return `contrast(${contrast}%)  brightness(${brightness}%)`;
}


function fore_back_filter(filterid) {
    const imgwidth = image1.naturalWidth,
          imgheight = image1.naturalHeight;

    const w = imgwidth - 16*(zoomInterval * zoomLevel), 
          h = imgheight - 9*(zoomInterval * zoomLevel);

    if ((w <= 0) || (h <= 0)){ // invalid width or height
        return;
    }

    let startW = (imgwidth - w) / 2,
        startH = (imgheight - h) / 2;

    const canvas = document.getElementById("canvas1");
    canvas.width = w;
    canvas.height = h;

    const context = canvas.getContext("2d", {willReadFrequently: true});
    
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    context.drawImage(image1, startW, startH,
        w, h, 0, 0, canvas.width, canvas.height  
    );
    

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    const pixels = imageData.data; //[r,g,b,a,...]

    console.log("zoom dimension = ", w, h, pixels.length/4);


    
    //------ filtering with canvas
    let r1 = 0, r2 = 0, g1 = 0, g2 = 0, b1 = 0, b2 = 0; 

    const clcBlack = [0, 0, 0],
          clcBlue = [43, 35, 127],
          clcYellow = [253, 255, 20],
          clcWhite = [255, 255, 255],
          clcRed = [255, 0, 0],
          clcGreen = [0, 175, 125];


    // 1- background, 2-text
    switch (filterid) {
        case "bow":
            r1 = clcBlack[0];
            g1 = clcBlack[1]; 
            b1 = clcBlack[2];

            r2 = clcWhite[0]; 
            g2 = clcWhite[1]; 
            b2 = clcWhite[2];

            break;
        
        case "boy":
            r1 = clcBlack[0]; 
            g1 = clcBlack[1]; 
            b1 = clcBlack[2];

            r2 = clcYellow[0]; 
            g2 = clcYellow[1]; 
            b2 = clcYellow[2];

            break;

        case "rog":
            r1 = clcGreen[0]; 
            g1 = clcGreen[1]; 
            b1 = clcGreen[2];

            r2 = clcRed[0]; 
            g2 = clcRed[1]; 
            b2 = clcRed[2];

            break;


        case "yobl":
            r1 = clcBlue[0]; 
            g1 = clcBlue[1]; 
            b1 = clcBlue[2]; 

            r2 = clcYellow[0]; 
            g2 = clcYellow[1]; 
            b2 = clcYellow[2];

            break;


        default:
            var pre = -1;
            // Contrast enhancement
            const contrast = filter11; 
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

            for (var i = 0; i < pixels.length; i += 4) {
                if (pre != pixels[i + 3]) {
                    console.log("alpha value", pixels[i + 3]);
                }

                pre = pixels[i + 3];
                pixels[i + 3] = 255; // very opaque


                pixels[i]     = factor * (pixels[i]     - 128) + 128; // Red
                pixels[i + 1] = factor * (pixels[i + 1] - 128) + 128; // Green
                pixels[i + 2] = factor * (pixels[i + 2] - 128) + 128; // Blue
            }

            context.putImageData(imageData, 0, 0);

            image.src = canvas.toDataURL();
            // console.log("origin = ", image.src.length, image1.src);

            return;
            break;
    }


    //---- ISP
    const threshold = 135; // 127

    for (var i = 0; i < pixels.length; i += 4) {
        // Contrast enhancement
        const contrast = filter11; 
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        pixels[i + 3] = 255; // very opaque
        
        var red = pixels[i];
        var green = pixels[i + 1];
        var blue = pixels[i + 2];

        red   = factor * (red   - 128) + 128; 
        green = factor * (green - 128) + 128; 
        blue  = factor * (blue  - 128) + 128; 


        const grayscale = getGrayValue(red, green, blue);

        if (grayscale > threshold) { // background
            pixels[i]     = r1;
            pixels[i + 1] = g1;
            pixels[i + 2] = b1;

        } else{ // text
            pixels[i]     = r2;
            pixels[i + 1] = g2;
            pixels[i + 2] = b2;
        }
    }


    context.putImageData(imageData, 0, 0);
    image.src = canvas.toDataURL();

    // console.log("filtered = ", image.src.length);
}


function getGrayValue(r, g, b){
    //return red * 0.2126 + green * 0.7152 + blue * 0.0722;
    return ((r * 6966) + (g * 23436) + (b * 2366)) >> 15;
}


var infullScreen = false;

function toggleFull() {
    if (infullScreen) {
        closeFullscreen();
    }else{
        openFullscreen();
    }

    infullScreen = !infullScreen;
}

function openFullscreen() {
    const sect = document.getElementById("sect");

    if (sect.requestFullscreen) {
        sect.requestFullscreen();
    } else if (sect.webkitRequestFullscreen) { /* Safari */
        sect.webkitRequestFullscreen();
    } else if (sect.msRequestFullscreen) { /* IE11 */
        sect.msRequestFullscreen();
    }

}
  
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}


/* 
Add fullscreen extra letter shortcut events 
1. b = brighter
2. d = dimmer
3. l = larger
4. s = smaller
5. c - high contrast
6. x = low contrast

1. q = white on black
2. w = yellow on blue
3. e = red on green
4. r = yellow on black
5. t = black on white

1. f = toggle fullscreen
*/

document.addEventListener("keydown", function(event) {
    if ((event.code === "KeyF") || (event.code === "Escape")) {
       toggleFull();
    } 


    else if (event.code === "KeyB") {
        ISPfunction(2);
    } 
    else if (event.code === "KeyD") {
        ISPfunction(3);
    } 


    else if (event.code === "KeyL") {
        ISPfunction(1);
    } 
    else if (event.code === "KeyS") {
        ISPfunction(0);
    } 


    else if (event.code === "KeyC") {
        ISPfunction(12);
    } 
    else if (event.code === "KeyX") {
        ISPfunction(13);
    } 


    else if (event.code === "KeyQ") {
        ISPfunction(6);
    } 
    else if (event.code === "KeyW") {
        ISPfunction(8);
    } 
    else if (event.code === "KeyE") {
        ISPfunction(9);
    } 
    else if (event.code === "KeyR") {
        ISPfunction(10);
    } 
    else if (event.code === "KeyT") {
        ISPfunction(7);
    } 
    
});


const editingRate = 500;
const updateInterval = 1000/(2 * editingRate); // 2 times faster for accomodating delays


setInterval(reload, updateInterval);

