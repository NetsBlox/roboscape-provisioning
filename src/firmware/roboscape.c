#include "simpletools.h"
#include "xbee.h"

enum {
    BUFFER_SIZE = 200,
    XBEE_DO_PIN = 4,
    XBEE_DI_PIN = 3,
    WHISKERS_LEFT_PIN = 8,
    WHISKERS_RIGHT_PIN = 9,
    PIEZO_SPEAKER_PIN = 2,
    PING_SENSOR_PIN = 6,
    BUTTON_PIN = 7,
    LED_0_PIN = 26,
    LED_1_PIN = 27,
    INFRA_LIGHT_PIN = 5,
    INFRA_LEFT_PIN = 11,
    INFRA_RIGHT_PIN = 10,
};

fdserial* xbee;
unsigned char buffer[BUFFER_SIZE];
int buffer_len;
int comSeqNum = 0;

/* unsigned char mac_addr[6]; */
/* unsigned char ip4_addr[4]; */
/* unsigned char ip4_port[2]; */

/* static const unsigned char server_addr[4] = { 52, 73, 65, 98 }; // netsblox.org */
/* //static const unsigned char server_addr[4] = { 129, 59, 104, 208 }; // mmaroti.isis.vanderbilt.edu */
/* static const unsigned char server_port[2] = { 0x07, 0xb5 }; // 1973 */

/* unsigned int time_ref = 0; */
/* unsigned int last_cnt = 0; */

/* int get_time() */
/* { */
/*     unsigned int elapsed = CNT - last_cnt; */
/*     while (elapsed >= CLKFREQ) { */
/*         elapsed -= CLKFREQ; */
/*         last_cnt += CLKFREQ; */
/*         time_ref += 1000; */
/*     } */
/*     return time_ref + elapsed / (CLKFREQ / 1000); */
/* } */

/* unsigned short ntohs(unsigned char* data) */
/* { */
/*     return (data[0] << 8) + data[1]; */
/* } */

void buffer_print(int len)
{
    print("buffer %d:", len);
    if (len > BUFFER_SIZE)
        len = BUFFER_SIZE;
    for (int i = 0; i < len; i++)
        print(" %02x", buffer[i]);
    print("\n");
}

/* int cmp_api_response(int len, const unsigned char* prefix) */
/* { */
/*     if (buffer_len != len) */
/*         return 0; */
/*     for (int i = 0; i < 5; i++) { */
/*         if (prefix[i] != buffer[i]) */
/*             return 0; */
/*     } */
/*     return 1; */
/* } */

/* int cmp_rx_headers(int len, unsigned char cmd) */
/* { */
/*     return buffer_len == len && buffer[0] == 0xb0 && buffer[11] == cmd; */
/* } */

/* void set_tx_headers(unsigned char cmd) */
/* { */
/*     int time = get_time(); */
/*     buffer[0] = 0x20; */
/*     buffer[1] = 0x10; */
/*     memcpy(buffer + 2, server_addr, 4); */
/*     memcpy(buffer + 6, server_port, 2); */
/*     memcpy(buffer + 8, ip4_port, 2); */
/*     buffer[10] = 0x00; */
/*     buffer[11] = 0x00; */
/*     memcpy(buffer + 12, mac_addr, 6); */
/*     memcpy(buffer + 18, &time, 4); */
/*     buffer[22] = cmd; */
/*     buffer_len = 23; */
/* } */

/* void write_le16(short data) */
/* { */
/*     memcpy(buffer + buffer_len, &data, 2); */
/*     buffer_len += 2; */
/* } */

/* void write_le32(int data) */
/* { */
/*     memcpy(buffer + buffer_len, &data, 4); */
/*     buffer_len += 4; */
/* } */

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

    /* xbee_send_api(xbee, "\x8\000NR", 4); */

    /* if (1) { */
    /*     xbee_send_api(xbee, "\x8\000IDvummiv", 10); */
    /* } else { */
    /*     xbee_send_api(xbee, "\x8\000IDrobonet", 11); */
    /*     xbee_send_api(xbee, "\x8\000EE\002", 5); */
    /*     xbee_send_api(xbee, "\x8\000PKcybercamp", 13); */
    /*     pause(100); // do not overflow the xbee buffer */
    /* } */

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
