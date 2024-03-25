#include <Servo.h>

Servo myservo;

void setup() {
  myservo.attach(9);  // set servo
  myservo.write(40);  // set default 40 degrees
  delay(10000);       // wait start 10 seconds
}

void loop() {
  // To 0 degrees
  for (int pos = 40; pos >= 0; pos -= 1) {
    myservo.write(pos);
    delay(15);
  }
  delay(10000);  // wait 10 seconds

  // To 40 degrees
  for (int pos = 0; pos <= 40; pos += 1) {
    myservo.write(pos);
    delay(15);
  }
  delay(10000);  // wait 10 seconds

  // To 80 degrees
  for (int pos = 40; pos <= 80; pos += 1) {
    myservo.write(pos);
    delay(15);
  }
  delay(10000);  // wait 10 seconds
  
  // To 40 degrees
  for (int pos = 80; pos >= 40; pos -= 1) {
    myservo.write(pos);
    delay(15);
  }
  delay(10000);  // wait 10 seconds
}
