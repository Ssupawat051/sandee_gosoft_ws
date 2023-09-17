#include <ros/ros.h>
#include <tf/transform_broadcaster.h>
#include <nav_msgs/Odometry.h>
#include "std_msgs/Float32.h"

//เก็บค่าพิกัดและการหมุนของหุ่นยนต์

  float x=0;
  float y=0;
  float th=0;

//เก็บระยะทางที่หุ่นยนต์เคลื่อนที่ไปทางซ้ายและขวา
  float dist_left;
  float dist_right;

//เก็บค่า encoder ของล้อซ้ายและขวา และค่าเก่าของ encoder ของล้อซ้ายและขวา.
  float encLeft;
  float encRight;
  
//ค่าเก่าของ encoder ของล้อซ้ายและขวา  
  float encLeft_old;
  float encRight_old;
  

float x=0;
float y=0;
float th=0;

//เก็บระยะทางที่หุ่นยนต์เคลื่อนที่ไปทางซ้ายและขวา
float dist_left;
float dist_right;

//เก็บค่า encoder ของล้อซ้ายและขวา และค่าเก่าของ encoder ของล้อซ้ายและขวา.
float encLeft;
float encRight;

//ค่าเก่าของ encoder ของล้อซ้ายและขวา
float encLeft_old;
float encRight_old;

//เก็บค่าระยะทางที่หุ่นยนต์เคลื่อนที่ต่อการเปลี่ยนแปลงของ encoder count โดยใช้สูตร (ค่าpi x ความกล้างของล้อ ) / ค่า pluseของencoderที่หมุนต่อ1รอบ
double DistancePerCount = (3.14159265 * 0.12192) / 583.2;

//..................................................................................
//เป็นฟังก์ชัน callback ที่ใช้ในการรับข้อมูล encoder count จาก topic "Enc_L" และเก็บข้อมูลลงในตัวแปร encLeft
void Enc_L_Callback(const std_msgs::Float32& encL)
{
	encLeft=encL.data;
}
//..................................................................................
//เป็นฟังก์ชัน callback ที่ใช้ในการรับข้อมูล encoder count จาก topic "Enc_R" และเก็บข้อมูลลงในตัวแปร encRight
void Enc_R_Callback(const std_msgs::Float32& encR)
{
	encRight=encR.data;
}
//..................................................................................
int main(int argc, char** argv){
  ros::init(argc, argv, "odometry_publisher");
  //สร้างอ็อบเจ็กต์ NodeHandle เพื่อจัดการการสื่อสารระหว่างโหนด ROS
  ros::NodeHandle n;
  ros::Publisher odom_pub = n.advertise<nav_msgs::Odometry>("odom", 50);

  
  //Subscriber เพื่อรับข้อมูล encoder count จาก topic "Enc_L" และ "Enc_R" 
  ros::Subscriber subL = n.subscribe("Enc_L", 1000, Enc_L_Callback);
  ros::Subscriber subR = n.subscribe("Enc_R", 1000, Enc_R_Callback);


  //Subscriber เพื่อรับข้อมูล encoder count จาก topic "Enc_L" และ "Enc_R" 
  ros::Subscriber subL = n.subscribe("Enc_L", 1000, Enc_L_Callback);
  ros::Subscriber subR = n.subscribe("Enc_R", 1000, Enc_R_Callback);
	

  tf::TransformBroadcaster odom_broadcaster;


  ros::Time current_time, last_time;
  current_time = ros::Time::now();
  last_time = ros::Time::now();

  ros::Rate r(20.0);
  while(n.ok()){]

    ros::spinOnce();               // check for incoming messages
   	current_time = ros::Time::now();

	//ระยะทางเฉลี่ย ล้อซ้าย
	dist_left = (encLeft-encLeft_old) * DistancePerCount;
	//ระยะทางเฉลี่ย ล้อขวา
  	dist_right = (encRight-encRight_old) * DistancePerCount;
  	//ระยะทางเฉลี่ย

	//ระยะทางเฉลี่ย ล้อซ้าย
	dist_left = (encLeft-encLeft_old) * DistancePerCount;
	////ระยะทางเฉลี่ย ล้อขวา
  	dist_right = (encRight-encRight_old) * DistancePerCount;
	//ระยะทางเฉลี่ย
	double dist =  (dist_right + dist_left) * 0.5;
	//อัตราการหมุนของหุ่นยนต์ ค่า0.422 คือระยะห่างของล้อ2ข้าง
    	double rota = (dist_left - dist_right) / 0.422;
	//อัพเดทค่า encLeft_old และ encRight_old ด้วยค่า encoder count ใหม่ล่าสุด.
	encLeft_old = encLeft;
	encRight_old = encRight;

	double dt = (current_time - last_time).toSec();
    	double delta_x = dist * cos(th + (rota/2.0));
    	double delta_y = dist * sin(th + (rota/2.0));
    	double delta_th = rota;


    //compute odometry in a typical way given the velocities of the robot
   	x += delta_x;
    	y += delta_y;
    	th += delta_th;

    //since all odometry is 6DOF we'll need a quaternion created from yaw
    geometry_msgs::Quaternion odom_quat = tf::createQuaternionMsgFromYaw(th);

    //first, we'll publish the transform over tf
    geometry_msgs::TransformStamped odom_trans;
    odom_trans.header.stamp = ros::Time::now();
    odom_trans.header.frame_id = "odom";
    odom_trans.child_frame_id = "base_link";

    odom_trans.transform.translation.x = x;
    odom_trans.transform.translation.y = y;
    odom_trans.transform.translation.z = 0.0;
    odom_trans.transform.rotation = odom_quat;

    //send the transform
    odom_broadcaster.sendTransform(odom_trans);

    //next, we'll publish the odometry message over ROS
    nav_msgs::Odometry odom;
    odom.header.stamp = ros::Time::now();
    odom.header.frame_id = "odom";

    //set the position
    odom.pose.pose.position.x = x;
    odom.pose.pose.position.y = y;
    odom.pose.pose.position.z = 0.0;
    odom.pose.pose.orientation = odom_quat;

    //set the velocity
    odom.child_frame_id = "base_link";
    odom.twist.twist.linear.x = delta_x/dt;
    odom.twist.twist.linear.y = delta_y/dt;
    odom.twist.twist.angular.z = delta_th/dt;

    //publish the message
    odom_pub.publish(odom);

    	last_time = current_time;

    r.sleep();
    
  }
}
