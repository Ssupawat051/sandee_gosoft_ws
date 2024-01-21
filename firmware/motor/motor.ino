#include <ArduinoHardware.h>
#include <ros.h> 
#include <geometry_msgs/Twist.h> 
#include <std_msgs/Float32.h> 
#include <Encoder.h>

Encoder myEncL(2, 3);
Encoder myEncR(18, 19);
long oldPositionL  = 0;
long oldPositionR  = 0;
ros::NodeHandle nh;


geometry_msgs::Twist msg;
std_msgs::Float32 encL_msg;
std_msgs::Float32 encR_msg;

ros::Publisher EncL("Enc_L", &encL_msg);
ros::Publisher EncR("Enc_R", &encR_msg);

  long newPositionL;
  long newPositionR;
  
void roverCallBack(const geometry_msgs::Twist& cmd_vel)
{

  double x = cmd_vel.linear.x;
        double z = cmd_vel.angular.z;

  double moveL = x+(z/2);
  double moveR = x-(z/2);

  
if (moveL>0.0){
        analogWrite(6,max(min(moveL*100,78),45));
        digitalWrite(7,0);
    }else if (moveL<0.0){
        analogWrite(6,max(min(abs(moveL)*100,78),45));
        digitalWrite(7,1);
    }else{ 
        analogWrite(6,0);
        digitalWrite(7,0);
  }

if (moveR>0.0){
        analogWrite(44,max(min(moveR*100,78),45));
        digitalWrite(45,0);
    }else if (moveR<0.0){
        analogWrite(44,max(min(abs(moveR)*100,78),45));
        digitalWrite(45,1);
    }else{ 
        analogWrite(44,0);
        digitalWrite(45,0);
        }

 
}
ros::Subscriber <geometry_msgs::Twist> Motor("/cmd_vel", roverCallBack);

void setup()
{
  pinMode(6,OUTPUT);  
  pinMode(7,OUTPUT); 
  pinMode(44,OUTPUT);
  pinMode(45,OUTPUT);   

  nh.initNode();
  nh.subscribe(Motor);
  nh.advertise(EncL);
  nh.advertise(EncR);
} 

void loop()
{
  
  newPositionL = myEncL.read();
  newPositionR = myEncR.read()*-1;
  
  if (newPositionL != oldPositionL) {
    oldPositionL = newPositionL;
     encL_msg.data = newPositionL;
  }
  if (newPositionR != oldPositionR) {
    oldPositionR = newPositionR;
     encR_msg.data = newPositionR;
  }
  if((newPositionL>100000000)||(newPositionR>100000000)||(newPositionL<-100000000)||(newPositionR<-100000000)){
  myEncL.write(0);
  myEncR.write(0);
  }
  EncL.publish( &encL_msg );
  EncR.publish( &encR_msg );
  nh.spinOnce();
  delay(10);
  
}
