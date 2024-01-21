#include "ros/ros.h"
#include <tf/transform_listener.h>
#include <geometry_msgs/PoseWithCovarianceStamped.h>
#include <geometry_msgs/PoseStamped.h>
#include <stdio.h>
#include <termios.h>    //termios, TCSANOW, ECHO, ICANON
#include <unistd.h>     //STDIN_FILENO
//#include <ros/ros.h>
//#include <json/json.h>
//#include <fstream>

int getch()
{
  static struct termios oldt, newt;
  tcgetattr( STDIN_FILENO, &oldt);           // save old settings
  newt = oldt;
  newt.c_lflag &= ~(ICANON);                 // disable buffering
  tcsetattr( STDIN_FILENO, TCSANOW, &newt);  // apply new settings

  int c = getchar();  // read character (non-blocking)

  tcsetattr( STDIN_FILENO, TCSANOW, &oldt);  // restore old settings
  return c;
}

void SetPose(double x, double y, double theta)
{
	//ros::init(argc, argv, "Set_Pose");
    ros::NodeHandle p_nav;
    ros::Publisher pubi = p_nav.advertise<geometry_msgs::PoseWithCovarianceStamped> ("/initialpose", 1);
    //ros::Rate loop_rate(10); // 10HZ = 0.1s

    std::string fixed_frame = "map";
    geometry_msgs::PoseWithCovarianceStamped pose;
    pose.header.frame_id = fixed_frame;
    pose.header.stamp = ros::Time::now();

    // set x,y coord
    pose.pose.pose.position.x = x;
    pose.pose.pose.position.y = y;
    pose.pose.pose.position.z = 0.0;

    // set theta
    tf::Quaternion quat;
    quat.setRPY(0.0, 0.0, theta);
    tf::quaternionTFToMsg(quat, pose.pose.pose.orientation);
    pose.pose.covariance[6*0+0] = 0.5 * 0.5;
    pose.pose.covariance[6*1+1] = 0.5 * 0.5;
    pose.pose.covariance[6*5+5] = M_PI/12.0 * M_PI/12.0;

    // publish
    ROS_INFO("initial pose : x: %f, y: %f, z: 0.0, theta: %f",x,y,theta);
    pubi.publish(pose);
}

void SendGoal(double x, double y, double theta)
{
        //ros::init(argc, argv, "Send_Goal");
    ros::NodeHandle p_nav;
    ros::Publisher pubg = p_nav.advertise<geometry_msgs::PoseStamped> ("move_base_simple/goal", 1);
    //ros::Rate loop_rate(10); // 10HZ = 0.1s

    std::string fixed_frame = "map";
    geometry_msgs::PoseStamped goal;
    goal.header.frame_id = fixed_frame;
    goal.header.stamp = ros::Time::now();

    // set x,y coord
    goal.pose.position.x = x;
    goal.pose.position.y = y;
    goal.pose.position.z = 0.0;

    // set theta
    tf::Quaternion quat;
    quat.setRPY(0.0, 0.0, theta);
    tf::quaternionTFToMsg(quat, goal.pose.orientation);

    // publish
    ROS_INFO("Send Goal : x: %f, y: %f, z: 0.0, theta: %f",x,y,theta);
    pubg.publish(goal);
}

/*std::string getDataFromJson(const std::string& jsonFilePath, const std::string& key) {
    std::ifstream file(jsonFilePath);
    Json::Reader reader;
    Json::Value root;
    reader.parse(file, root);

    std::string value = root[key].asString();
    return value;
}*/


int main(int argc, char** argv)
{
	ros::init(argc, argv, "send_position");
	ros::NodeHandle p_nav;
	ros::start();

	ros::NodeHandle p_nav;
	ros::Publisher pubi = p_nav.advertise<geometry_msgs::PoseWithCovarianceStamped> ("/initialpose", 1);
  ros::Publisher pubg = p_nav.advertise<geometry_msgs::PoseStamped> ("move_base_simple/goal", 1);

  //std::string jsonFilePath = "/home/mark/test_room18.json"; //

  ros::Rate loop_rate(10);

  /*while(ros::ok()){
    ros::spinOnce();

    std::string valueC = getDataFromJson(jsonFilePath,"C");

    if(valueC == "001"){
      SetPose(-0.006, -0.025,  0.086);
      SendGoal(-0.006, -0.025,  0.086);
    }
    else if (valueC == "010"){
      SendGoal(3.382, 1.152, 1.616);
    }
    else {
      ROS_INFO("Sorry Broooo");
    }
    loop_rate.sleep();
  }*/  
  while (ros::ok()){
  ros::spinOnce();
  int c = getch();   // call your non-blocking input function
  if (c == '0'){
	SetPose(0.020, 0.027,0.041);
	SendGoal(0.020, 0.027,0.041);
	}
  else if (c == '1'){
  SendGoal(2.999,-0.099,0.027);
  }
  else if (c == '2'){
  SendGoal(11.085,-0.235,0.023);
  }
  else if (c == '3'){
  SendGoal(7.515,0.064,0.035);
  }
  else {
    ROS_INFO("Sorry not in command brooo");
  }
  loop_rate.sleep();
 }
  return 0;


}
