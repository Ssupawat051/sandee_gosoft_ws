# urdf_ws
SanDee
step run in gazebo
1.roslaunch gazebo_ros empty_world.launch # create map
2.roslaunch urdf_sim spawn_sandee.launch #spawn robot
3.rosrun urdf_sim sandee_all.py #run auto

##### take control #####
rosrun teleop_twist_keyboard teleop_twist_keyboard.py

###rviz sim####
roslaunch urdf_sim call_urdf.launch


##ถ้าขึ้น bash: /home/san/rplidar_ws/devel/setup.bash: No such file or directory ##
ใช้คำสั่งgedit .bashrc เเล้วไปลบชื่อที่error


step run robot 
:Lidar + Ros


:MotorEncoder + Ros
1.roscore
2.rosrun rosserial_arduino serial_node.py _port:=/dev/ttyUSB1
3.rosrun teleop_twist_keyboard teleop_twist_keyboard.py
