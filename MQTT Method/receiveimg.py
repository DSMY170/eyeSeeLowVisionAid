# need to install pahomqtt first
# Open cmd/Terminal and type: pip install paho_mqtt
import paho.mqtt.subscribe as subcriber 

# broker = '172.20.47.115'
broker = 'broker.hivemq.com'
port = 1883
# topic_sub = "photos"
topic_sub = "images/new/version/livestream/Ameba"
client_id = 'gtrfgfdftuvfjgfyfcxzcfghjt123'



def subscribe():
    print ('Subscibibing')
    
    
    msg = subcriber.simple(topics=topic_sub, 
                           hostname=broker, 
                           client_id=client_id,
                           retained=False)
    
    print ('Subscibed')
    # f = open('c:\\Users\\User\\Downloads\\daniel\\receive.jpg', 'wb')
    f = open('.\receive.jpg', 'wb') 
    f.write(msg.payload)
    f.close()
    
    print ('image received')
        
        
        
def main():
    subscribe()
    
    
if __name__ == '__main__':
    while True: 
        main()