#include "simpletools.h"
#include "xbee.h"

enum {
    BUFFER_SIZE = 200,
    XBEE_DO_PIN = 4,
    XBEE_DI_PIN = 3,
};

fdserial* xbee;
unsigned char buffer[BUFFER_SIZE];
char response[10];
int buffer_len;
int comSeqNum = 0;

void buffer_print(int len)
{
    print("buffer %d:", len);
    if (len > BUFFER_SIZE)
        len = BUFFER_SIZE;
    for (int i = 0; i < len; i++)
        print(" %02x", buffer[i]);
    print("\n");
}


void display_incoming()
{
    buffer_len = xbee_recv_api(xbee, buffer, BUFFER_SIZE, 10);
    if (buffer_len > 0) {
        print("resp: ");
        buffer_print(buffer_len);
    }
}

// used for configuation stage
void com_sync(const char* cmd, int len, char* comment)
{
    comSeqNum++;
    char frame [len + 2];
    frame[0] = 8; // frame type
    frame[1] = comSeqNum; // add request number
    for(int i=2;i<len+2;i++) { // append the cmd
        frame[i] = cmd[i-2];
    }
    print("#### %s ####\n", comment);
    /* print("sending: %s \n", cmd); */
    xbee_send_api(xbee, frame, len + 2);
    pause(100);
    display_incoming();
    print("==========\n");
}

void software_reset_xbee()
{
    print("software resetting the xbee module\n");
    pause(1000);
    xbee_send_api(xbee, "\8\000FR", 4);
    display_incoming();
    pause(15000);
    print("finished resetting xbee\n");
}

int xbcmd(char *cmd, char *reply, int bytesMax, int msMax)
{
  int c = -1, n = 0;
  writeStr(xbee, cmd);
  memset(reply, 0, bytesMax);

  int tmax = (CLKFREQ/1000) * msMax;
  int tmark = CNT;

  while(1)
  {
    c = fdserial_rxCheck(xbee);
    if(c != -1)
      reply[n++] = c;
    if(CNT - tmark > tmax)
      return 0;
    if(c == '\r')
      return n;
  }
}

/* void com_sync2(const char* cmd, int len, char* comment) */
/* { */
/*     char* frame [len+1]; */
/*     for(int i=0;i<len;i++) { // append the cmd */
/*         print("moving %s", cmd[i]); */
/*         frame[i] = cmd[i]; */
/*     } */
/*     print(frame); */
/*     frame[len] = "\r"; */
/*     print("cmd = %s\n", cmd); */
/*     print("frame = %s\n", frame); */
/*     xbcmd(frame, response, 10, 20); */
/*     print("reply = %s", response); */
/* } */

int main()
{
    /* print("start\n"); */
    input(XBEE_DO_PIN);
    xbee = xbee_open(XBEE_DO_PIN, XBEE_DI_PIN, 1);
    pause(1000);
    /* com_sync("EQ", 2, "getting the etherios device cloud fqdn (custom field)"); */

    /* software_reset_xbee(); */
    /* com_sync("NR", 2, "Network reset"); */



    /* /1* com_sync("CE\2", 3, "setting infrastructure mode"); *1/ */
    /* com_sync("CE", 2, "checking infrastructure mode"); */
    /* /1* com_sync("DO", 2, "checking device option"); *1/ */
    /* /1* com_sync("DO\1", 3, "setting device option 1 (enable softap when id null)"); *1/ */
    /* /1* com_sync("NR", 2, "Network reset"); *1/ */
    /* /1* com_sync("SL", 2, "low bits of mac address"); *1/ */
    /* /1* com_sync("SH", 2, "high bits of mac address"); *1/ */
    /* /1* com_sync("C0\37", 3, "set serial com port"); *1/ */
    /* /1* com_sync("C0", 2, "checking serial communication port"); *1/ */
    /* /1* com_sync("MY", 2, "checking MY"); *1/ */
    /* com_sync("DO", 2, "checking device option"); */
    /* com_sync("AI", 2, "checking association"); */
    /* com_sync("ID", 2, "checking ID"); */

  print("cmd = +++\n");
  int bytes = xbcmd("+++", response, 10, 2000);
  if(bytes == 0)
    print("Timeout error.\n");
  else
  {
    print("reply = %s", response);


    print("\n##### network reset xbee #####\n");
    xbcmd("ATNR\r", response, 10, 20);
    print("reply = %s", response);

    print("\n##### checking eq (payload) #####\n");
    xbcmd("ATEQ\r", response, 10, 20);
    print("reply = %s", response);

    print("\n##### checking infrastructure mode #####\n");
    xbcmd("ATCE\r", response, 10, 20);
    print("reply = %s", response);

    print("\n##### checking device option #####\n");
    xbcmd("ATDO\r", response, 10, 20);
    print("reply = %s", response);

    print("\n##### checking low bits of mac #####\n");
    xbcmd("ATSL\r", response, 10, 20);
    print("reply = %s", response);

    print("\n##### checking association #####\n");
    xbcmd("ATAI\r", response, 10, 20);
    print("reply = %s", response);

    print("\n##### checking ID #####\n");
    xbcmd("ATID\r", response, 10, 20);
    print("reply = %s", response);

  }

    int c = 1;
    while (1) {
        /* pause(1000); */
        /* print("hello world\n %d", c++); */
        display_incoming();
    }
}
