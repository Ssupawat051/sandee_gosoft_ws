#include <ros.h>
#include <std_msgs/String.h>
#include <geometry_msgs/Twist.h>
#include <Encoder.h>

int pwm1 = 38 ;
int dir1 = 39;
int pwm2 = 44;
int dir2= 45;

double prev_time = 0;
double robot_x = 0;
double robot_y = 0;
double robot_theta = 0;

Encoder myEncoder1(2, 3); //encoderR Pin:a,b
Encoder myEncoder2(18, 19);//encoderL Pin:a,b

const float WheelRad = 0.12192; // in to m
const int PulseRv = 3246; // PULSES_PER_REVOLUTION
const float WheelSeparation = 0.422;

ros::NodeHandle  nh;

geometry_msgs::Twist Enc_msg;
ros::Publisher Pub ("Enc_mt", &Enc_msg);

unsigned long lastUpdateTime = 0; // last update encoder
const unsigned long updateInterval = 100; //encoder update time 0.1s

void setcallback(const geometry_msgs::Twist& cmd_vel){
  double vel_x = cmd_vel.linear.x;
  double vel_th = cmd_vel.angular.z;
  double moveR = vel_x+(vel_th/2);
  double moveL = vel_x-(vel_th/2);

  //motor R
  if(moveR>0.0){
    analogWrite(38,64);
    digitalWrite(39,1);
    }
  else if(moveR<0.0){
    analogWrite(38,64);
    digitalWrite(39,0);
    }
  else{
    analogWrite(38,0);
    digitalWrite(39,0);
    }
    
  //motor L
  if(moveL>0.0){
    analogWrite(44,64);
    digitalWrite(45,0);
    }
  else if(moveL<0.0){
    analogWrite(44,64);
    digitalWrite(45,1);
    }
  else{
    analogWrite(44,0);
    digitalWrite(45,0);
  }
}
ros::Subscriber <geometry_msgs::Twist> Sub("/cmd_vel", setcallback);

void robotpose(double motor1_speed, double motor2_speed) {
  
  double avg_speed = (motor1_speed + motor2_speed) / 2.0;

  double distance = avg_speed * 0.1;

  double delta_theta = (motor2_speed - motor1_speed) / WheelSeparation * 0.1;

  robot_x += distance * cos(robot_theta + delta_theta / 2);
  robot_y += distance * sin(robot_theta + delta_theta / 2);
  robot_theta += delta_theta;
 /* Serial.print("Robot Position: x = ");
  Serial.print(robot_x);
  Serial.print(", y = ");
  Serial.print(robot_y);
  Serial.print(", theta = ");
  Serial.println(robot_theta);*/
}
  
void setup() {
  nh.initNode();
  nh.advertise(Pub);
  nh.subscribe(Sub);
  
  Serial.begin(115200);
  
  pinMode(38,OUTPUT);
  pinMode(39,OUTPUT);
  pinMode(44,OUTPUT);
  pinMode(45,OUTPUT);
}

void loop() {
  nh.spinOnce();
  
  unsigned long currentTime = millis();
  if (currentTime - lastUpdateTime >= updateInterval) {
    lastUpdateTime = currentTime;
    
    long count1 = myEncoder1.read();
    long count2 = myEncoder2.read();

    //speed motor : m/s
    double motor1_speed = (double)count1 / PulseRv * (2 * 3.14 * WheelRad);
    double motor2_speed = (double)count2 / PulseRv * (2 * 3.14 * WheelRad);
   
    //print(currentTime);
    
    //robotpose(motor1_speed , motor2_speed);
    Enc_msg.linear.x = motor1_speed;
    Enc_msg.linear.y = motor2_speed;
    Pub.publish( &Enc_msg );
  }
  
}
