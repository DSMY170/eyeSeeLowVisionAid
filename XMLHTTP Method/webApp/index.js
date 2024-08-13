//----- get request uri
const baseFixedUrl = "http://192.168.137.86",
      trailer = "/9783";
var baseUrl  = "", getParam = "";

//----- filter keys and values
var isPlay = true, filter1 = 100, picfilter = "nothing";


//------ image tags on web app
const image1 = document.getElementById("img1");
const image  = document.getElementById("img");
baseUrl = image1.src;


function reload() {
    if (isPlay) {
        const xhttpGetImage = new XMLHttpRequest();
        xhttpGetImage.responseType = 'blob';
        xhttpGetImage.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200){
                console.log("New Image");
                //console.log("New Image",this.response);
                
                var url = window.URL.createObjectURL(this.response);
                
                baseUrl = image1.src = url;
                
                // image.style.filter = imgISP(filter, filter1);
            }
        };

        console.log(baseFixedUrl + getParam + trailer, "me");
    
        xhttpGetImage.open('GET', baseFixedUrl + getParam + trailer, true);
        xhttpGetImage.send();
    }
    

    fore_back_filter(picfilter);

    image.style.filter = imgISP(filter1);
    // console.log(image.style.filter1);
}



function ISPfunction(option) {
    //---- filter index

    switch (option) {
        case 0:
            console.log("zooom in");
            getParam = "/zoom";
            break;
        
        case 1:
            console.log("zooom out");
            getParam = "/zoom";
            break;


        case 2:
            console.log("brighten");
            // getParam = "/bright1";
            // start = "/1";
            filter1 = (filter1 >= 200)? 200 : filter1 + 10;

            break;

        case 3:
            console.log("dim");
            filter1 = (filter1 <= 50)? 50 : filter1 - 10;

            break;


        case 4:
            console.log("play");
            isPlay = true;
            break;

        case 5:
            console.log("pause");
            isPlay = false;
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
            getParam = "/pass=";
            break;
                
        default:
            break;
    }

    // fore_back_filter(picfilter);

}


function imgISP(filter12) {
    return "contrast(200%)  brightness(" + filter12.toString() + "%) ";
}


function fore_back_filter(filterid) {
    //------ filtering with canvas
    let r1 = 0, r2 = 0, g1 = 0, g2 = 0, b1 = 0, b2 = 0; 

    const clcBlack = [0, 0, 0],
          clcBlue = [43, 35, 127],
          clcYellow = [253, 255, 20],
          clcWhite = [255, 255, 255],
          clcRed = [255, 0, 0],
          clcGreen = [0, 175, 125]

          ;

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
            image.src = image1.src;
            return;
            break;
    }

    
    const canvas = document.getElementById("canvas1");
    canvas.width = image1.naturalWidth;
    canvas.height = image1.naturalHeight;
    const context = canvas.getContext("2d");

    context.drawImage(image1, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const threshold = 119; // 127

    const pixels = imageData.data; //[r,g,b,a,...]
    for (var i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];

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

    // context.clearRect(0, 0, canvas.width, canvas.height);
}


function getGrayValue(r, g, b){
    //return red * 0.2126 + green * 0.7152 + blue * 0.0722;
    return ((r * 6966) + (g * 23436) + (b * 2366)) >> 15;
}



setInterval(reload, 5);
