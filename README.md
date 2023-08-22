# urdf_ws
SanDee
step run
1.roslaunch gazebo_ros empty_world.launch # create map
2.roslaunch urdf_sim spawn_sandee.launch #spawn robot
3.rosrun urdf_sim sandee_all.py #run auto

##### take control #####
rosrun teleop_twist_keyboard teleop_twist_keyboard.py

