
#include <WiFi.h>
#include "VideoStream.h"



//------ choose camera settings resolution
#define CHANNEL 0 // 1920 x 1080 @1080p
VideoSetting config(VIDEO_FHD, CAM_FPS, VIDEO_JPEG, 1);


uint8_t constrast = 0;

uint32_t img_addr = 0;
uint32_t img_len = 0;


// ------------- WIFI SETTIGS
char ssid[] = "Type your network SSID here";   // your network SSID (name)
char pass[] = "Type your network password here"; // your network password

int status = WL_IDLE_STATUS;

IPAddress local_IP(192, 168, 137, 86); // Desired Static IP 


// ------- Set web server port number to 80
WiFiServer server(80);
String header; // Variable to store the HTTP request


void sendImage(WiFiClient& client, uint8_t* buf, uint32_t len) {
    uint8_t header_buf[128] = {0};

    // generate header information buffer
    uint8_t header_len = snprintf( 
          (char*)header_buf, 
          128, 
          "HTTP/1.1 200 OK\r\nContent-type:image/jpeg\r\n"
          "Access-Control-Allow-Origin:*\r\n"
          "Content-Length:%lu\r\n\r\n", 
          len);

            
    client.write(header_buf, header_len);
    client.write(buf, len);
    client.print("\r\n");
}




void setup() {
    Serial.begin(115200);

    /* Configures Static IP Address */
    WiFi.config(local_IP);

    while (status != WL_CONNECTED) {
        status = WiFi.begin(ssid, pass);
        delay(50);
    }
    
    Camera.configVideoChannel(CHANNEL, config);
    Camera.videoInit();
    Camera.channelBegin(CHANNEL);

    server.begin();
}



void loop() {
    WiFiClient client = server.available();

    if (client) {
        //Serial.println("new client connected");
        // an http request ends with \r\n\r\n == blank line 
        boolean currentLineIsBlank = true;

        while (client.connected()) {
          
            if (client.available()) {
                char c = client.read();
                //Serial.write(c);

                /* 
                 *  get only request-line from reequests which is in te form
                 *      HTTP_METHOD   URL   HTTP_VERSION\r\n
                */
                if(header.indexOf("\n") < 0){
                    header += c; // store request-line info
                }

                
                if ((c == '\n') && currentLineIsBlank) {
                    Serial.println(header);

                    
                    /* if (header.indexOf("GET /zoom") >= 0) {
                        Camera.zoom(2, CHANNEL);
                        Camera.videoDeinit();
                        Camera.videoInit();
                    } */

                   /*  else if (header.indexOf("GET /bright1") >= 0) {
                      constrast = (constrast >= BRIGHTNESS_MAX)? BRIGHTNESS_MAX : constrast + 1;
                      configCam.setBrightness(constrast);
                    } 
                    
                    else if (header.indexOf("GET /dim1") >= 0) {
                       constrast = (constrast <= BRIGHTNESS_MIN)? BRIGHTNESS_MIN : constrast - 1;
                       configCam.setBrightness(constrast);
                    } 
                     */
                   
                    Camera.getImage(CHANNEL, &img_addr, &img_len);
                    sendImage(client, (uint8_t*)img_addr, img_len);
                    break;
                }   
                
                if (c == '\n') {
                  // you're starting a new line
                  currentLineIsBlank = true;
                } 
                
                else if (c != '\r') {
                    // you've gotten a character on the current line
                    currentLineIsBlank = false;
                }
                
            }
        
        }


        // Clear the header variable
        header = "";
        
        delay(1); // give broswer time to send response
        client.stop();
        
        //Serial.println("client disconnected");
    } 
    

}
