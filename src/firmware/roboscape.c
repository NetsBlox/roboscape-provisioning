#include "simpletools.h"
#include "xbee.h"

enum {
    BUFFER_SIZE = 200,
    XBEE_DO_PIN = 4,
    XBEE_DI_PIN = 3,
};

fdserial* xbee;
unsigned char buffer[BUFFER_SIZE];
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
    frame[0] = 8;
    frame[1] = comSeqNum;
    for(int i=2;i<len+2;i++) {
        frame[i] = cmd[i-2];
    }
    print("#### %s ####\n", comment);
    /* print("sending: %s \n", cmd); */
    xbee_send_api(xbee, frame, len + 2);
    pause(100);
    display_incoming();
    print("==========\n");
}

int main()
{
    input(XBEE_DO_PIN);
    xbee = xbee_open(XBEE_DO_PIN, XBEE_DI_PIN, 1);

    com_sync("FR", 2, "software reset the xbee module");
    com_sync("NR", 2, "Network reset");
    com_sync("CE\1", 3, "setting infrastructure mode");
    com_sync("CE", 2, "checking infrastructure mode");
    com_sync("DO", 2, "checking device option");
    com_sync("DO\1", 3, "setting device option 1 (enable softap when id null)");
    /* com_sync("NR", 2, "Network reset"); */
    /* com_sync("SL", 2, "low bits of mac address"); */
    /* com_sync("SH", 2, "high bits of mac address"); */
    com_sync("C0\37", 3, "set serial com port");
    com_sync("C0", 2, "checking serial communication port");
    /* com_sync("MY", 2, "checking MY"); */
    com_sync("DO", 2, "checking device option");
    com_sync("AI", 2, "checking association");
    com_sync("ID", 2, "setting ID testAp");
    com_sync("ID", 2, "checking ID");


    while (1) {
        display_incoming();
    }
}
