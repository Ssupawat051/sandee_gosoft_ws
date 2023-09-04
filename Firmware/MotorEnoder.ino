#include <ArduinoHardware.h>
#include <ros.h> 
#include <geometry_msgs/Twist.h> 
#include <std_msgs/Float32.h> 
#include <Encoder.h>

Encoder myEncL(2, 27); //encoder L
Encoder myEncR(19, 23);//encoder R

long oldPositionL  = 0;
long oldPositionR  = 0;

ros::NodeHandle nh;


geometry_msgs::Twist msg;
std_msgs::Float32 encL_msg; //get value motor
std_msgs::Float32 encR_msg;

ros::Publisher EncL("Enc_L", &encL_msg);
ros::Publisher EncR("Enc_R", &encR_msg);

  long newPositionL;
  long newPositionR;
  
void callback(const geometry_msgs::Twist& cmd_vel)
{

  double x = cmd_vel.linear.x;
  double z = cmd_vel.angular.z;

  double moveL = x+(z/2); //contro wheel L
  double moveR = x-(z/2);

/////////////////////////////////////////////////  
  if (moveL > 0.0){ //forward
    analogWrite(5,max(min(moveL*100,255),158)); // pwm min=158 max =255
    digitalWrite(30,0); //dir
    
    
   }
   
  else if (moveL < 0.0){ //backward
    analogWrite(5,max(min(abs(moveL)*100,255),158));
    digitalWrite(30,1);
    
    }
    
  else{  //stop
    analogWrite(5,0);
    digitalWrite(30,0);

  }
  
///////////////////////////////////////

  if (moveR > 0.0){
    analogWrite(7,max(min(moveR*100,255),158);
    digitalWrite(22,0);
    
    }
    
  else if (moveR < 0.0){
    analogWrite(7,max(min(abs(moveR)*100,255),158));
    digitalWrite(22,1);
    }
    
  else{ 
    analogWrite(7,0);
    digitalWrite(22,0);
    }
}

ros::Subscriber <geometry_msgs::Twist> Motor("/cmd_vel", callback);

void setup()
{
  //motor L
  pinMode(5,OUTPUT);  //pwm
  pinMode(30,OUTPUT); //dir
  

  //motor R
  pinMode(7,OUTPUT);  //pwm
  pinMode(22,OUTPUT); //dior

  
  
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
  
  if((newPositionL>1000000)||(newPositionR>1000000)||(newPositionL<-1000000)||(newPositionR<-1000000)){
  myEncL.write(0);
  myEncR.write(0);
  }
  
  EncL.publish( &encL_msg );
  EncR.publish( &encR_msg );
  nh.spinOnce();
  delay(10);
  
}
