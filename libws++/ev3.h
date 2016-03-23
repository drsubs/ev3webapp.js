#pragma GCC diagnostic ignored "-Wwrite-strings"

#ifndef __EV3_H
#define __EV3_H

#define MOTOR_PATH "/sys/class/tacho-motor/"
#define SENSOR_PATH "/sys/class/lego-sensor/"

#include "server.h"
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <deque>
using namespace std;

enum PORT_TYPES {
	PORT_POWER = 0,
	PORT_PORT,
	PORT_MESSAGE
};

class Ports;
extern Ports *ports;
extern int file_error;


int ws_main(int argc,char *arg[]);
int _pump();
void destroyLwsl();

class Port {
public:
	Port(char *p);
	Port() : msgNum(0) { portType=PORT_PORT; }
	virtual ~Port() {}
	int write(char const *p,int value);
	int write(char const *p,char *value);
	int readInt(char const *p);
	char *readStr(char *buf,char const *p);
	inline char *probertyName(char *b,char *p) { 
		return strcat(strcat(strcpy(b,path),"/"),p);
	};
	char address[32];
	char path[128];
	int portType;
	char mode[16];
	char driver_name[16];
	int msgNum;
};
class Power : public Port{
public:
	Power() : Port() {
		strcpy(path,"/sys/class/power_supply/legoev3-battery");
		strcpy(address,"power");
		strcpy(driver_name,"power");
	}
	~Power() {}
};
class Led : public Port{
public:
	Led(char *led) : Port() {
		strcat(strcpy(path,"/sys/class/leds/"),led);
		strcpy(address, led);
		strcpy(driver_name,"Led");
	}
	~Led() {}
};

typedef int (*evCallback)(char*,char*,char*);

class Message {
public:
	Message(char *c,char *m) : chnl(c),msg(m) { }
	~Message() { }
	char *channel() { return (char*)chnl.c_str(); }
	char *message() { return (char*)msg.c_str(); }
	string chnl;
	string msg;
};

class msgQue {
public:
	msgQue() {}
	~msgQue() {
		while(que.size()) {
			delete que[0];
			que.pop_front();
		}
	}
	void send(char *chnl,char *m) {
		Message *msg=new Message(chnl,m);
		que.push_back(msg);
	}
	int msg(char *p) {
		if(que.size()>0) {
			Message *msg=(Message*) que.front();
			que.pop_front();
			sprintf(p,"{\"channel\":\"%s\",\"data\":%s}",msg->channel(),msg->message());
			delete msg;
			return strlen(p);
		}
		return 0;
	}
	
	std::deque<Message*> que;
};
class Ports {
public:
	Ports();
	~Ports() {
		if(psdlist.size()) {
			std::vector<per_session_data__port_data*>::iterator v=psdlist.begin();
			while(v != psdlist.end()) {
				delete (*v)->msgque;
				v++;
			}
		}
	}
	void addPsd(per_session_data__port_data *psd) {
		psdlist.push_back(psd);
	}
	void removePsd(per_session_data__port_data *psd) {
		for(unsigned int i=0;i<psdlist.size();i++) {
			if(psdlist[i] == psd) psdlist.erase(psdlist.begin()+i);
		}
	}
	int isMsgque() {
		for(unsigned int i=0;i<psdlist.size();i++) {
			if(psdlist[i]->msgque->que.size() > 0) {
				return 1;
			}
		}
		return 0;
	}
	int msg(char *p,per_session_data__port_data *psd) {
		if(psd->msgque->que.size()) {
			return psd->msgque->msg(p);
		}
		return 0;
	}
	void addListener(evCallback cb) {
		cblist.push_back(cb);
	}
	void send(char* chnl,char *m) {
		if(psdlist.size()) {
			std::vector<per_session_data__port_data*>::iterator v=psdlist.begin();
			while(v!=psdlist.end()) {
				(*v)->msgque->send(chnl,m);
				v++;
			}
		}
	}  
	void dispatch(char *p) {
		char *sp=p;
		while(*sp) {
			char *target=sp;
			sp=strchr(sp,':');
			sp[0]=0;
			char *cmd=sp+1;
			sp=strchr(cmd,';');
			sp[0]=0;
			sp++;
			printf("dispatch rcv target %s command %s\n",target,cmd);
			std::vector<evCallback>::iterator v = cblist.begin();
			int done=0;
			while(v != cblist.end()) {
				evCallback cb=*v;
				int res = cb(target,cmd,sp);
				if(res==1) done=1;
				if(res==2) return;
				v++;
			}
			if(!done) {
				printf("Unknown target %s command %s\n",target,cmd);
				} 
			}
		}
	std::vector<evCallback> cblist;
	std::vector<per_session_data__port_data*> psdlist;
};

#endif

