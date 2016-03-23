/*
 * 	js.h
 * 
 */

#include <vector>

#define SRC_PATH "/home/robot/ws/html/projects/"
#define LIB_PATH "/home/robot/ws/html/lib/"
#define CONFIG_PATH "/home/robot/ws/html/projects/"
#define CONFIG_FILE "/home/robot/ws/html/projects/config"
void getProject(char *buf);

extern volatile int script_flag;

class jscb {
public:
	jscb(string c,string cb,v7_val_t cnx=0) : chnl(c),callback(cb),cnxt(cnx) {}
	
	string chnl;
	string callback;
	v7_val_t cnxt;
};

extern vector<jscb*> jscblist;


char *loadFile(char *fn);
char *getString(struct v7 *v7,int arg);
v7_val_t mkString(char *p,int copy=0);
enum v7_err js_ev3Read(struct v7 *v7, v7_val_t *res);
enum v7_err js_ev3Write(struct v7 *v7, v7_val_t *res);
enum v7_err js_ev3Log(struct v7 *v7, v7_val_t *res);
enum v7_err js_ev3On(struct v7 *v7, v7_val_t *res);
enum v7_err js_ev3(struct v7 *v7, v7_val_t *res);
enum v7_err js_ev3Send(struct v7 *v7, v7_val_t *res);
enum v7_err js_ev3Require(struct v7 *v7, v7_val_t *res);
v7_val_t mkUtils(struct v7 *v7);
v7_val_t mkMotors(struct v7 *v7);
v7_val_t mkSensors(struct v7 *v7);
int jsControl(char *target,char *cmd,char *b);
int runscript(char *target,char *cmd,char *b);
void call_loop();
int jsDispatcher(char *target,char *cmd,char *b);
void call_epilog();

