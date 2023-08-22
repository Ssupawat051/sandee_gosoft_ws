#!/usr/bin/env python3

import rospy 
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist

def laser_callback(msg):
    fornt = msg.ranges[360]
    right = msg.ranges[300]
    left = msg.ranges[420]
    range_array = {'front' : fornt, 'left' : left , 'right' : right }

    rospy.loginfo ('front : %f left : %f right : %f',fornt,left,right)

    avoidance(range_array)

def avoidance  (range_array):
    vel_msg = Twist()
    linear_x = 0
    angular_z = 0

    if range_array['front']>1.5 and range_array['left']  >1.5 and range_array['right'] >1.5:
        robot_status = 'go on'
        linear_x = 0.5 
        angular_z = 0

    elif range_array['front']<1.5 and range_array['left']  >1.5 and range_array['right'] >1.5:
        robot_status = 'front'
        linear_x = 0 
        angular_z = 1

    elif range_array['front']>1.5 and range_array['left']  <1.5 and range_array['right'] >1.5:
        robot_status = 'left'
        linear_x = 0.5 
        angular_z = -1

    elif range_array['front']>1.5 and range_array['left']  >1.5 and range_array['right'] <1.5:
        robot_status = 'right'
        linear_x = 0.5 
        angular_z = 1    

    else :
        robot_status = 'unknow'
        linear_x = 0
        angular_z = 1

    rospy.loginfo(robot_status)
    vel_msg.linear.x = linear_x
    vel_msg.angular.z = angular_z
    pub.publish(vel_msg)

def main():
    global pub
    rospy.init_node('Laser_Scan_Data_Loading')
    sub = rospy.Subscriber("/sandee/laser/scan",LaserScan,laser_callback)
    pub = rospy.Publisher("/cmd_vel",Twist, queue_size=5)
    rospy.spin()

if __name__ == "__main__":
    main()

