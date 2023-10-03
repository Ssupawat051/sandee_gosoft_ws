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
1.ls -l /dev/ttyUSB0
2.sudo chmod 666 /dev/ttyUSB0
3.roslaunch rplidar_ros view_rplidar.launch

:MotorEncoder + Ros
1.roscore
2.rosrun rosserial_arduino serial_node.py _port:=/dev/ttyUSB1
3.rosrun teleop_twist_keyboard teleop_twist_keyboard.py


///////////
ติดตั้ง ROS Noetic
1.sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
2.sudo apt install curl # if you haven't already installed curl
3.curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -
4.sudo apt update
5.sudo apt install ros-noetic-desktop-full
6.sudo apt install ros-noetic-slam-gmapping
7.source /opt/ros/noetic/setup.bash
8.echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
source ~/.bashrc
9.sudo apt install python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool build-essential
10.sudo apt install python3-rosdep
11.sudo rosdep init
12.rosdep update

การสร้างworkspace
1.mkdir catkin_ws (catkin_ws สามารถตั้งชื่ออื่นได้)
2.mkdir catkin_ws/src
3.cd catkin_ws/src 
4.catkin_init_workspace
5.cd ..
6.catkin_make
7.echo "source ~/catkin_ws/devel/setup.bash" >> ~/.bashrc
8.source ~/.bashrc


การติดตั้ง Arduino 1.8.10
sudo ./install.sh

ติดตั้ง Libery ใน Arduino
1.rosserial
2.encoder by paul stoffregen

การรันcode arduino ใน ทอมิเนอร์
1.cd sandee_ws/firmware/Motor
2.arduino --upload /sandee_ws/firmware/Motor/Motor.ino --port ~/dev/ttyUSB0

สร้างเเพคเกจ ใน tf (pub) ไฟล์ที่1
1.cd catkin_ws/src
2.catkin_create_pkg test_tf roscpp tf geometry_msgs
3.cd test_tf/src
4.sudo nano tf_test.cpp
5.cd --
6.cd catkin_ws
7.catkin_make

สร้างเเพคเกจ ใน tf (sub) ไฟล์ที่2
1.cd catkin_ws/src
2.cd test_tf
3.cd src
4.sudo nano tf_listen.cpp
5.cd --
6.cd catkin_ws
7.catkin_make

การรันtf
rosrun tf test_tf

ติดตั้ง Rosserial
sudo apt-get install ros-noetic-rosserial

ติดตั้ง teleop
sudo apt-get install ros-noetic-teleop-twist-keyborad

การรัน การใช้ teleop
1.roscore
2.rosrun rosserial_arduino serial_node.py _port:=/dev/ttyUSB0
3.rosrun teleop_twist_keyboard teleop_twist_keyboard.py

สร้างเเพคเกจ odom
1.cd catkin_ws/src
2.catkin_create_pkg odom_setup roscpp tf
3.cd src
4.sudo nano myodom.cpp
5.cd --
6.cd catkin_ws
7.catkin_make

การรันodom
rosrun odom myodom


การรันlidar
1.ls -l /dev/ttyUSB0
2.sudo chmod 666 /dev/ttyUSB0
3.roslaunch rplidar_ros rplidar.launch
4.rostopic echo /scan
5.roslaunch hector_slam_launch tutorial.launch
6.rosrun map_server map_saver -f my_room

step run code
roscore
ls -l /dev/ttyUSB0
sudo chmod 666 /dev/ttyUSB0
roslaunch rplidar_ros rplidar.launch
rostopic echo /scan
roslaunch hector_slam_launch tutorial.launch
rosrun map_server map_saver -f my_room

arduino --upload /sandee_ws/firmware/Motor/Motor.ino --port ~/dev/ttyUSB1
rosrun test_tf test_tf
rosrun odom_setup odom
rosrun rosserial_arduino serial_node.py _port:=/dev/ttyUSB1
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
rosrun rviz rviz
