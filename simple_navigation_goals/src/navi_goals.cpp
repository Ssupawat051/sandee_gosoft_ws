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
    ifstream file("/home/sandee/sandee_ws/src/jsonfile/control.json");
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
        goal.target_pose.pose.orientation.x = waypoint["goal.target_pose.pose.orientation.x"];
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

        // Close the file before looping again
        file.close();
    

    return 0;
  
}
