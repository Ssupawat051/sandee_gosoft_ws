# sandee_ws
- Robot name: SanDee
- ROS version: Noetic
- Processor: Mini pc (Intel i3-6100U ,Ram 8 GB)
- Controller: Arduino Mega 2560
- Sensor: Encoder , Lidar
- Version: 0.0.1

### DONE
- [x] Control real robot with joystick
- [x] Create and Save map for navigation
- [x] URDF mobile robot
- [x] Use robot with navigation stack

### Variable table
| Variable | Meaning |
| --- | --- |
| Odom|  |
| TF |  |
| cmd_vel |  |

## How to install Ros noetic

1. ``sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'``
2. ``sudo apt install curl # if you haven't already installed curl``
3. ``curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -``
4. ``sudo apt update``
5. ``sudo apt install ros-noetic-desktop-full``
6. ``sudo apt install ros-noetic-slam-gmapping``
7. ``source /opt/ros/noetic/setup.bash``
8. ``echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc``
9. ``source ~/.bashrc``
10. ``sudo apt install python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool build-essential``
11. ``sudo apt install python3-rosdep``
12. ``sudo rosdep init``
13. ``rosdep update``


## How to install Package with Ros

### How to install Hector slam
``sudo apt-get install ros-noetic-hector-slam``

### How to install map-server
``sudo apt-get install ros-noetic-map-server``

### How to install navigation
``sudo apt-get install ros-noetic-navigation``

### How to install teb-local-planner
``sudo apt-get install ros-noetic-teb-local-planner``

### How to install Rosserial
``sudo apt-get install ros-noetic-rosserial``
``sudo apt-get install ros-noetic-rosserial-arduino``

### How to install teleop
``sudo apt-get install ros-noetic-teleop-twist-keyboard``
#### How to run teleop
``rosrun teleop_twist_keyboard teleop_twist_keyboard.py``

### How to install joygame
1. ``sudo apt-get install ros-noetic-joy``
2. ``sudo apt-get install ros-noetic-teleop-twist-joy``
#### How to run joygame
1. ``rosrun joy joy_node``
2. ``rosrun teleop_twist_joy teleop_node``

### How to install json
``sudo apt-get install libjsoncpp-dev``
``sudo apt-get install nlohmann-json3-dev``

## Error & Troubleshooting
 ```bibtex
ถ้าขึ้น bash: /home/san/rplidar_ws/devel/setup.bash: No such file or directory
```
1. ``cd /home/your_name_pc`` for home directory
2. ``gedit .bashrc`` เเล้วไปลบชื่อที่error

## How to install Arduino 1.8...
1. ``เข้าไปในเว็บ https://www.arduino.cc/en/software``
2. ``เลือก version Arduino IDE 1.8...``
3. ``เลือกโหลด Linux ZIP file 64 bits (X86-64)``
4. ``แตกไฟล์ที่โหลด แล้วเปิด Terminal ``
5. ``sudo ./install.sh``
 
### Install Library in Arduino
1. ``rosserial``
2. ``encoder by paul stoffregen``

#### How to run code arduino with terminal
1. ``cd sandee_ws/firmware/Motor``
2. ``arduino --upload /sandee_ws/firmware/Motor/Motor.ino --port ~/dev/ttyUSB0``

#### Error #include <cstring>
1.``Home/Arduino/libraries/Rosserial/src/ros/msg.h``
2.``เปลี่ยน #include <cstring> เป็น #include <string.h>``
3.``เปลี่ยน std::memcpy(&val, &f, sizeof(val)); เป็น memcpy(&val, &f, sizeof(val)); ``
4.``เปลี่ยน std::memcpy(f, &val, sizeof(val)); เป็น memcpy(f, &val, sizeof(val)); ``

## How to run for Robot
### How to get map (Lidar + Slam + Odom + TF + Teleop Joygame)
1. ``roscore``
2. ``ls -l /dev/ttyUSB0``
3. ``sudo chmod 666 /dev/ttyUSB0``
4. ``roslaunch rplidar_ros view_rplidar.launch``
5. ``rostopic echo /scan``
6. ``roslaunch hector_slam_launch tutorial.launch``
7. ``arduino --upload /sandee_ws/firmware/Motor/Motor.ino --port ~/dev/ttyUSB1``
8. ``rosrun odom myodom`` 
9. ``rosrun rosserial_arduino serial_node.py _port:=/dev/ttyUSB1``
10. ``rosrun joy joy_node``
11. ``rosrun teleop_twist_joy teleop_node``
12. ``rosrun map_server map_saver -f my_room`` (คือการ save map หลังจากเดินทั่วห้อง ,my_room คือชื่อที่สามารถตั้งเองได้)

### How to run final for robot
1. `` roscore``
2. ``roslaunch simple_navigation_goals navi.launch``
3. ``rosrun simple_navigation_goals sim_goals``

###########################################################################################
### Simulation in gazebo

#### step run in gazebo
1. ``roslaunch gazebo_ros empty_world.launch`` # create map
2. ``roslaunch urdf_sim spawn_sandee.launch`` #spawn robot
3. ``rosrun urdf_sim sandee_all.py`` #run auto

#### How to take control
``rosrun teleop_twist_keyboard teleop_twist_keyboard.py``

#### rviz sim
``roslaunch urdf_sim call_urdf.launch``
############################################################################################
/home/sandee/sandee_ws/src/simple_navigation_goals/src/navi_goals.cpp:5:10: fatal error: nlohmann/json.hpp: No such file or directory
    5 | #include <nlohmann/json.hpp>
