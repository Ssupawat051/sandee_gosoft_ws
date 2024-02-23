#include <ros/ros.h>
#include <move_base_msgs/MoveBaseAction.h>
#include <actionlib/client/simple_action_client.h>
#include <fstream>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;
typedef actionlib::SimpleActionClient<move_base_msgs::MoveBaseAction> MoveBaseClient;

int main(int argc, char** argv) {
    ros::init(argc, argv, "json_goal_node");
    ros::NodeHandle nh;

    // Create a MoveBaseClient
    MoveBaseClient ac("move_base", true);

    // Wait for the action server to come up
    while (!ac.waitForServer(ros::Duration(5.0))) {
        ROS_INFO("Waiting for the move_base action server to come up");
    }

    // Open the JSON file
    ifstream file("/home/mark/sandee_ws/src/jsonflie/control.json");
    if (!file.is_open()) {
        cerr << "Error opening file!" << endl;
        return 1;
    }

    // Read and parse the JSON data
    json data;
    file >> data;

    // Access data from JSON object and create goals
    vector<move_base_msgs::MoveBaseGoal> goals;
    for (const auto& item : data.items()) {
        json waypoint = item.value();

        move_base_msgs::MoveBaseGoal goal;
        goal.target_pose.header.frame_id = "map";
        goal.target_pose.header.stamp = ros::Time::now();
        goal.target_pose.pose.position.x = waypoint["goal.target_pose.pose.position.x"];
        goal.target_pose.pose.position.y = waypoint["goal.target_pose.pose.position.y"];
        goal.target_pose.pose.position.z = waypoint["goal.target_pose.pose.position.z"];
        goal.target_pose.pose.orientation.y = waypoint["goal.target_pose.pose.orientation.y"];
        goal.target_pose.pose.orientation.z = waypoint["goal.target_pose.pose.orientation.z"];
        goal.target_pose.pose.orientation.w = waypoint["goal.target_pose.pose.orientation.w"];

        goals.push_back(goal);
    }

    // Send goals to waypoints
    for (size_t i = 0; i < goals.size(); ++i) {
        ROS_INFO("Sending goal to waypoint %zu", i + 1);
        ac.sendGoal(goals[i]);

        // Wait for the robot to reach the goal or timeout after 5 seconds
        if (!ac.waitForResult(ros::Duration(5.0))) {
            ROS_WARN("Timeout reached while waiting for the robot to reach waypoint %zu", i + 1);
        }

        // Check if the goal is still active
        if (ac.getState() == actionlib::SimpleClientGoalState::ACTIVE) {
            ROS_INFO("Robot is still moving to waypoint %zu", i + 1);
            // Wait for the robot to reach the current goal before moving to the next one
            ac.waitForResult();
        }
        else if (ac.getState() == actionlib::SimpleClientGoalState::SUCCEEDED) {
            ROS_INFO("Robot has arrived at waypoint %zu", i + 1);
        }
        else {
            ROS_INFO("Robot failed to reach waypoint %zu", i + 1);
        }

        // Optionally, you can add a delay to allow time for the robot to reach the goal
        ros::Duration(5.0).sleep(); // Sleep for 5 seconds
    }

    return 0;
}


/*
#include <ros/ros.h>
#include <move_base_msgs/MoveBaseAction.h>
#include <actionlib/client/simple_action_client.h>

typedef actionlib::SimpleActionClient<move_base_msgs::MoveBaseAction> MoveBaseClient;

int main(int argc, char** argv){
  ros::init(argc, argv, "simple_navigation_goals");

  //tell the action client that we want to spin a thread by default
  MoveBaseClient ac("move_base", true);

  //wait for the action server to come up
  while(!ac.waitForServer(ros::Duration(5.0))){
    ROS_INFO("Waiting for the move_base action server to come up");
  }

  move_base_msgs::MoveBaseGoal goal;

  //we'll send a goal to the robot to move 1 meter forward
  goal.target_pose.header.frame_id = "map";
  goal.target_pose.header.stamp = ros::Time::now();

  goal.target_pose.pose.position.x = 1.028315544128418;
  goal.target_pose.pose.position.y = -0.00013113021850585938;
  goal.target_pose.pose.position.z = 0;

  goal.target_pose.pose.orientation.x = 0;
  goal.target_pose.pose.orientation.y = 0;
  goal.target_pose.pose.orientation.z = 0.009763037281712437;
  goal.target_pose.pose.orientation.w = 0.9999523404158;

  ROS_INFO("goal 1");
  ac.sendGoal(goal);

  ac.waitForResult();

  if(ac.getState() == actionlib::SimpleClientGoalState::SUCCEEDED)
    ROS_INFO("goal 1 pass");
  else
    ROS_INFO("goal 1 failed");
//--------------------------
goal.target_pose.pose.position.x = 1.4182753562927246;	 		
goal.target_pose.pose.position.y = -1.0060367584228516;  
goal.target_pose.pose.position.z = 0;

goal.target_pose.pose.orientation.x = 0;
goal.target_pose.pose.orientation.y = 0;
goal.target_pose.pose.orientation.z = -0.6932950424805454;
goal.target_pose.pose.orientation.w = 0.7206538587088108;

ROS_INFO("goal 2");
ac.sendGoal(goal);

ac.waitForResult();

if(ac.getState() == actionlib::SimpleClientGoalState::SUCCEEDED)
  ROS_INFO("goal 2 pass");
else
  ROS_INFO("goal 2 failed");
//-----------------------------
goal.target_pose.pose.position.x = 1.4927113056182861;	 		
goal.target_pose.pose.position.y = -2.3172130584716797;  
goal.target_pose.pose.position.z = 0;

goal.target_pose.pose.orientation.x = 0;
goal.target_pose.pose.orientation.y = 0;
goal.target_pose.pose.orientation.z = 0.9991170026029254;
goal.target_pose.pose.orientation.w = 0.04201446310196004;


ROS_INFO("goal 3");
ac.sendGoal(goal);

ac.waitForResult();

if(ac.getState() == actionlib::SimpleClientGoalState::SUCCEEDED)
  ROS_INFO("goal 3 pass");
else
  ROS_INFO("goal 3 failed");
  return 0;
}
*/