#include "simpletools.h"
#include "datetime.h"

enum {
  BUTTON_PIN = 7,
  SHORT_PRESS = 500,
  LONG_PRESS = 10000,
  PRESSED = 0,
};

int buttonState;     // current state of the button
int lastButtonState = 1; // previous state of the button
int startPressed = 0;    // the time button was pressed
int endPressed = 0;      // the time button was released
int timeHold = 0;        // the time button is hold
int timeReleased = 0;    // the time button is released


// assumes dt_run is called
int curMs() {
  datetime time = dt_get();
  int curSec = time.s;
  int relMs = dt_getms(); //relative ms
  int totalMs = curSec*1000 + relMs; // assuming that ms isn't close to 999 and second hasn't changed
  return totalMs;
}

void main() {
  // setup date

  datetime dt = { 2000, 1, 1, 1, 1, 1 };
  dt_run(dt);

  while (1) {

    // read the pushbutton input pin:
    buttonState = input(BUTTON_PIN);

    /* print("curms %d \n", curMs()); */

    // button state changed
    if (buttonState != lastButtonState) {
      lastButtonState = buttonState;

      // the button was just pressed
      if (buttonState == PRESSED) {
        startPressed = curMs();
        timeReleased = startPressed - endPressed;

        if (timeReleased >= 500 && timeReleased < 1000) {
          print("Button idle for half a second\n"); 
        }

        if (timeReleased >= 1000) {
          print("Button idle for one second or more\n"); 
        }

        // the button was just released
      } else {
        endPressed = curMs();
        timeHold = endPressed - startPressed;

        if (timeHold >= 500 && timeHold < 1000) {
          print("Button hold for half a second\n"); 
        }

        if (timeHold >= 1000) {
          print("Button hold for one second or more\n"); 
        }

      }
    }

    pause(50);
  } // end of loop
}
