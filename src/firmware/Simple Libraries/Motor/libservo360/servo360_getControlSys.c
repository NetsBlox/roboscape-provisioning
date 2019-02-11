/*
  @servo360_getControlSys.c

  @author Parallax Inc

  @copyright
  Copyright (C) Parallax Inc. 2017. All Rights MIT Licensed.  See end of file.
 
  @brief 
*/


#include "simpletools.h"  
#include "servo360.h"


int servo360_getControlSys(int pin, int constant)
{
  if(!_fb360c.servoCog) servo360_run();
  int p = servo360_findServoIndex(pin);
  if(p == -1)return -1;
  
  int value; 
  
  switch(constant)
  {
    case S360_SETTING_KPV:
      value = _fs[p].KpV;
      break;
    case S360_SETTING_KIV:
      value = _fs[p].KiV;
      break;
    case S360_SETTING_KDV:
      value = _fs[p].KdV;
      break;
    case S360_SETTING_IV_MAX:
      value = _fs[p].iMaxV;
      break;
    case S360_SETTING_KPA:
      value = _fs[p].Kp;
      break;
    case S360_SETTING_KIA:
      value = _fs[p].Ki;
      break;
    case S360_SETTING_KDA:
      value = _fs[p].Kd;
      break;
    case S360_SETTING_IA_MAX:
      value = _fs[p].iMax;
      break;
  }  
  return value;
}    


/**
 * TERMS OF USE: MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */