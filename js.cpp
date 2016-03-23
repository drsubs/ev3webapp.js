/*
 *
 *	js.cpp
 *	
 * Javascript objects, methods and functions.
 * 
 *
*/

#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <fstream>
#include <iostream>
#include <cstdio>
#include <string>

using namespace std;

#include <ev3.h>
#include <v7.h> 
#include "js.h"

#define SRC_PATH "/home/robot/ws/html/projects/"

v7_val_t exec_result;
struct v7 *v7=NULL;
vector<jscb*> jscblist;

volatile int script_flag=0;

char *loadFilex(char *fn) {
	string line;
	string file("");
	string fname(SRC_PATH);
	
	fname.append(string(fn));
	ifstream infile(fname);
	if(infile.is_open()) {
		while(!infile.eof()) {
			getline(infile,line);
			file.append(line);
			file.append(string("\n"));
		}		
	} else printf ("Couldn't open the %s file",fn);
	infile.close();
	size_t len=file.length();
	char *p=(char*) malloc(len+1);
	strcpy(p,file.c_str());
	return p;
}

v7_val_t mkString(char *p,int copy) {
	return v7_mk_string(v7,p, strlen(p),copy);
}
enum v7_err js_ev3Read(struct v7 *v7, v7_val_t *res) {
	v7_val_t arg0 = v7_arg(v7, 0);
	char *prb=(char*)v7_to_cstring(v7,&arg0);
	v7_val_t this_obj = v7_get_this(v7);
	Port *prt=(Port*)v7_to_foreign(v7_get(v7,this_obj,"device",~0));
	char buf[256];
	prt->readStr(buf,prb);
	if(file_error) {
			char msg[128];
			sprintf(msg,"{message:\"Error reading from property %s\"}",prb);
			ports->send("log",msg);
			file_error=0;
	}
	*res = mkString(buf,true);
	return V7_OK;
}
enum v7_err js_ev3Write(struct v7 *v7, v7_val_t *res) {
	v7_val_t arg0 = v7_arg(v7, 0);
	v7_val_t arg1 = v7_arg(v7, 1);
	char prb[32];
	char val[32];
	double nval;
	
	strcpy(prb,(char*)v7_to_cstring(v7,&arg0));

	v7_val_t this_obj = v7_get_this(v7);
	Port *prt=(Port*)v7_to_foreign(v7_get(v7,this_obj,"device",~0));
	
	if(v7_is_number(arg1)) {
		nval = v7_to_number(arg1);
		if(prt->write((const char*)prb,(int)nval)==-1) {
			char msg[128];
			sprintf(msg,"{message:\"Error writeing to property %s\"}",prb);
			ports->send("log",msg);
			file_error=0;
		}
	}
	if(v7_is_string(arg1)) {
		strcpy(val,v7_to_cstring(v7, &arg1));
		if(prt->write((const char*)prb,val)==-1) {
			char msg[128];
			sprintf(msg,"{message:\"Error writeing to property %s\"}",prb);
			ports->send("log",msg);
			file_error=0;			
		}
	}
	return V7_OK;
}

vector<Port*> jsportlist;

v7_val_t mkDevice(struct v7 *v7,Port *port) {
	jsportlist.push_back(port);
	v7_val_t obj = v7_mk_object(v7);
	v7_set(v7,obj,"device",~0,v7_mk_foreign(port));
	
	v7_val_t result=v7_set_method(v7, obj, "read", &js_ev3Read);
	if(result!=0) {
		ports->send("log","{message:\"Error building javascript enviorment adding read function to object.\"}");
		return obj;
	}
	result=v7_set_method(v7, obj, "write", &js_ev3Write);
	if(result!=0) {
		ports->send("log","{message:\"Error building javascript enviorment adding write tunction to object.\"}");
		return obj;
	}
	return obj;
}
v7_val_t mkDev(struct v7 *v7) {
	v7_val_t mobj= v7_mk_object(v7);
	v7_val_t rightleds= v7_mk_object(v7);
	v7_val_t leftleds= v7_mk_object(v7);
	v7_val_t leds= v7_mk_object(v7);

	v7_val_t obj = mkDevice(v7,new Power());
	v7_set(v7,mobj,"Power",~0,obj);

	v7_val_t ledrr=mkDevice(v7,new Led("ev3:right:red:ev3dev"));
	v7_set(v7,rightleds,"red",~0,ledrr);
	v7_val_t ledrg=mkDevice(v7,new Led("ev3:right:green:ev3dev"));
	v7_set(v7,rightleds,"green",~0,ledrg);
	v7_set(v7,leds,"right",~0,rightleds);
	
	v7_val_t ledlr=mkDevice(v7,new Led("ev3:left:red:ev3dev"));
	v7_set(v7,leftleds,"red",~0,ledlr);
	v7_val_t ledlg=mkDevice(v7,new Led("ev3:left:green:ev3dev"));
	v7_set(v7,leftleds,"green",~0,ledlg);
	v7_set(v7,leds,"left",~0,leftleds);

	v7_set(v7,mobj,"Leds",~0,leds);

	return mobj;
}
v7_val_t mkMotors(struct v7 *v7) {
	DIR *dp;
	struct dirent *ep;
	v7_val_t mobj= v7_mk_object(v7);
	dp = opendir ("/sys/class/tacho-motor/");
	if (dp != NULL) {
		while ((ep = readdir (dp))) {
			if((strcmp(ep->d_name,".")!=0) && (strcmp(ep->d_name,"..")!=0)) {
				string path("/sys/class/tacho-motor/");
				path.append(string(ep->d_name));
				v7_val_t obj = v7_mk_object(v7);
				Port *mtr=new Port((char*)path.c_str());
				jsportlist.push_back(mtr);
				v7_set(v7,obj,"device",~0,v7_mk_foreign(mtr));
				
				char commands[128];
				mtr->readStr(commands,"commands");
				v7_set(v7,obj,"commands",~0,mkString(commands,true));
				char stop_commands[128];
				mtr->readStr(stop_commands,"stop_commands");
				v7_set(v7,obj,"stop_commands",~0,mkString(stop_commands,true));
				
				v7_val_t result=v7_set_method(v7, obj, "read", &js_ev3Read);
				if(result!=0) {
					ports->send("log","{message:\"Error building javascript enviorment adding read to Motor object.\"}");
					return obj;
				}
				result=v7_set_method(v7, obj, "write", &js_ev3Write);
				if(result!=0) {
					ports->send("log","{message:\"Error building javascript enviorment adding write to Motor object.\"}");
					return obj;
				}
				v7_set(v7,mobj,mtr->address,~0,obj);
				
			}
		}
		closedir (dp);	
	}
	return mobj;
}
v7_val_t mkSensors(struct v7 *v7) {
	DIR *dp;
	struct dirent *ep;
	v7_val_t mobj= v7_mk_object(v7);
	dp = opendir ("/sys/class/lego-sensor/");
	if (dp != NULL) {
		while ((ep = readdir (dp))) {
			if((strcmp(ep->d_name,".")!=0) && (strcmp(ep->d_name,"..")!=0)) {
				string path("/sys/class/lego-sensor/");
				path.append(string(ep->d_name));
				v7_val_t obj = v7_mk_object(v7);
				Port *snsr=new Port((char*)path.c_str());
				jsportlist.push_back(snsr);
				v7_set(v7,obj,"device",~0,v7_mk_foreign((void*)snsr));
				char modes[128];
				snsr->readStr(modes,"modes");
				int values=snsr->readInt("num_values");
				v7_set(v7,obj,"modes",~0,mkString(modes,true));
				v7_set(v7,obj,"values",~0,v7_mk_number((double)values));
				v7_val_t result=v7_set_method(v7, obj, "read", &js_ev3Read);
				if(result!=0) {
					ports->send("log","{message:\"Error building javascript enviorment adding read to Sensor object.\"}");
					return obj;
				}
				result=v7_set_method(v7, obj, "write", &js_ev3Write);
				if(result!=0) {
					ports->send("log","{message:\"Error building javascript enviorment adding write to Sensor object.\"}");
					return obj;
				}
				v7_set(v7,mobj,snsr->address,~0,obj);				
			}
		}
		closedir (dp);	
	}
	return mobj;
}
enum v7_err js_ev3Log(struct v7 *v7, v7_val_t *res) {
	enum v7_err rcode = V7_OK;	
	v7_val_t arg0 = v7_arg(v7, 0);
	char msg[1024];
	char buf[1024];

	strcpy(msg,(char*)v7_to_cstring(v7,&arg0));
	sprintf(buf,"{message:\"%s\"}",msg);
	ports->send("log",buf);
	return rcode;
}
enum v7_err js_ev3Send(struct v7 *v7, v7_val_t *res) {
	enum v7_err rcode = V7_OK;	
	v7_val_t arg0 = v7_arg(v7, 0);
	v7_val_t arg1 = v7_arg(v7, 1);
	char c[32];
	char m[1024];
	strcpy(m,(char*)v7_to_cstring(v7,&arg1));
	strcpy(c,(char*)v7_to_cstring(v7,&arg0));
	//printf("Send %s = %s\n",c,m);
	ports->send(c,m);
	return rcode;
}
enum v7_err js_ev3Lib(struct v7 *v7, v7_val_t *res) {
	enum v7_err rcode = V7_OK;	
	v7_val_t arg0 = v7_arg(v7, 0);
	char p[1024];
	strcpy(p,(char*)v7_to_cstring(v7,&arg0));
	char fn[256];
	v7_val_t result;
	
	strcat(strcpy(fn,LIB_PATH),p);
	rcode=v7_exec_file(v7, fn, &result);
	if (rcode != V7_OK) {
		char sbuf[256];
		sprintf(sbuf,"{message:\"%s in file %s\"}",v7_get_parser_error(v7),p);
		ports->send("log",sbuf);
		sprintf(sbuf,"Evaluation error in file %s",p);
		v7_print_error(stderr, v7, (const char*)sbuf, result);
		return rcode;
	}	
	return V7_OK;
}

enum v7_err js_ev3Require(struct v7 *v7, v7_val_t *res) {
	enum v7_err rcode = V7_OK;	
	v7_val_t arg0 = v7_arg(v7, 0);
	char p[1024];
	strcpy(p,(char*)v7_to_cstring(v7,&arg0));
	char fn[256];
	v7_val_t result;
	char prj[32];
	
	getProject(prj);
	strcat(strcat(strcat(strcpy(fn,SRC_PATH),prj),"/"),p);
	rcode=v7_exec_file(v7, fn, &result);
	if (rcode != V7_OK) {
		char sbuf[256];
		sprintf(sbuf,"{message:\"%s in file %s\"}",v7_get_parser_error(v7),p);
		ports->send("log",sbuf);
		sprintf(sbuf,"Evaluation error in file %s",p);
		v7_print_error(stderr, v7, (const char*)sbuf, result);
		return rcode;
	}	
	return V7_OK;
}

enum v7_err js_ev3On(struct v7 *v7, v7_val_t *res) {
	v7_val_t arg0 = v7_arg(v7, 0);
	v7_val_t arg1 = v7_arg(v7, 1);
	v7_val_t arg2 = v7_arg(v7, 2);
	char c[32];
	strcpy(c,(char*)v7_to_cstring(v7,&arg0));
	char cb[32];
	strcpy(cb,(char*)v7_to_cstring(v7,&arg1));	
	jscblist.push_back(new jscb(string(c),string(cb),arg2));
	return V7_OK;
}

v7_val_t mkUtils(struct v7 *v7) {
	v7_val_t obj= v7_mk_object(v7);
	v7_val_t result=v7_set_method(v7, obj, "log", &js_ev3Log);
	if(result!=0) {
		ports->send("log","{message:\"Error building javascript enviorment adding log to Msg object.\"}");
		return obj;
	}
	result=v7_set_method(v7, obj, "send", &js_ev3Send);
	if(result!=0) {
		ports->send("log","{message:\"Error building javascript enviorment adding send to Msg object.\"}");
		return obj;
	}
	result=v7_set_method(v7, obj, "on", &js_ev3On);
	if(result!=0) {
		ports->send("log","{message:\"Error building javascript enviorment adding on to Msg object.\"}");
		return obj;
	}
	return obj;
}
 
int jsDispatcher(char *target,char *cmd,char *b) {
	enum v7_err rcode = V7_OK;
	v7_val_t func,args;
	int done=0;
	
	vector<jscb*>::iterator v = jscblist.begin();
	
	while(v!=jscblist.end()) { 
		jscb *jcb=*v;
		if(strcmp(jcb->chnl.c_str(),target)==0) {
			done=1;
			func = v7_get(v7, jcb->cnxt ,jcb->callback.c_str() , ~0);
			args = v7_mk_array(v7);
			v7_array_push(v7, args, v7_mk_string(v7,cmd,~0,1));
			rcode = v7_apply(v7, func,v7_is_undefined(jcb->cnxt) ? v7_get_global(v7) : jcb->cnxt, args, &exec_result);
			if(rcode!=V7_OK) {
				char sbuf[256];
				sprintf(sbuf,"{message:\"%s\"}",v7_get_parser_error(v7));
				ports->send("log",sbuf);
				v7_print_error(stderr, v7, "Evaluation error", exec_result);		
			}
			
		}
		v++;
	}
	return done;
	
}
int jsControl(char *target,char *cmd,char *b) {
	if(strcmp(target,"jscontrol")!=0) return 0; // not to os.
	if((strcmp(cmd,"pause")==0) && (script_flag)) {
		script_flag=0;
		return 1;
	}
	if((strcmp(cmd,"resume")==0) && (v7!=NULL)) {
		script_flag=1;
		return 1;
	}
	if((strcmp(cmd,"stop")==0)  && (v7!=NULL)) {
		call_epilog();
		v7_destroy(v7);
		v7=NULL;		
		script_flag=0;
		return 1;
	}
	return 1;
}
int runscript(char *target,char *cmd,char *b) {
	if(strcmp(target,"runscript")!=0) return 0; // not to os.

	enum v7_err rcode = V7_OK;	
	for(auto v=jscblist.begin();v!=jscblist.end();v++) {
		delete *v;
	}
	jscblist.clear();

	if(v7!=NULL) { 
		for(auto dev = jsportlist.begin();dev != jsportlist.end(); dev++) {
			delete *dev;
		} 
		jsportlist.clear();
		v7_destroy(v7);
		v7=NULL;
		if(script_flag) {
			script_flag=0;
		}
	}

	v7_val_t result;
	v7 = v7_create();
	v7_val_t mtr=mkMotors(v7);
	result=v7_set(v7,v7_get_global(v7),"Motors",~0,mtr);
	v7_val_t snsr=mkSensors(v7);
	result=v7_set(v7,v7_get_global(v7),"Sensors",~0,snsr);
	v7_val_t utils=mkUtils(v7);
	result=v7_set(v7,v7_get_global(v7),"Msg",~0,utils);
	v7_val_t dev=mkDev(v7);
	result=v7_set(v7,v7_get_global(v7),"System",~0,dev);
	result=v7_set_method(v7, v7_get_global(v7), "lib", &js_ev3Lib);
	result=v7_set_method(v7, v7_get_global(v7), "require", &js_ev3Require);

	char fn[128];
	strcat(strcpy(fn,SRC_PATH),cmd);
	rcode=v7_exec_file(v7, fn, &result);
	if (rcode != V7_OK) {
		char sbuf[256];
		sprintf(sbuf,"{message:\"%s\"}",v7_get_parser_error(v7));
		ports->send("log",sbuf);
		v7_print_error(stderr, v7, "Evaluation error", result);
		v7_destroy(v7);
		v7=NULL;
		return 1;
	}	
	script_flag=1;
	return 1;
}
void call_loop() {
	enum v7_err rcode = V7_OK;
	v7_val_t func;

	func = v7_get(v7, v7_get_global(v7), "loop", ~0);
	//puts("Before loop");
	rcode = v7_apply(v7, func, v7_mk_undefined(), v7_mk_undefined(), &exec_result);
	//puts("After loop");
	if (rcode != V7_OK) {
		char sbuf[256];
		sprintf(sbuf,"{message:\"%s\"}",v7_get_parser_error(v7));
		ports->send("log",sbuf);
		v7_print_error(stderr, v7, "Evaluation error", exec_result);
		script_flag=0;
	}
	v7_gc(v7,1);
}
void call_epilog() {
	enum v7_err rcode = V7_OK;
	v7_val_t func;

	func = v7_get(v7, v7_get_global(v7), "epilog", ~0);
	if(v7_is_undefined(func)==0) {
		rcode = v7_apply(v7, func, v7_mk_undefined(), v7_mk_undefined(), &exec_result);
		if (rcode != V7_OK) {
			char sbuf[256];
			sprintf(sbuf,"{message:\"%s\"}",v7_get_parser_error(v7));
			ports->send("log",sbuf);
			v7_print_error(stderr, v7, "Evaluation error", exec_result);
			script_flag=0;
		}
	}
}
