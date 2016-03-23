/*
 *
*/
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fstream>
#include <iostream>
#include <cstdio>
#include <string>
#include <vector>

using namespace std;

#include <ev3.h>
#include <v7.h> 
#include "js.h"

void getProject(char *buf) {
	string line;
	string file("");
	ifstream infile(CONFIG_FILE);
	if(infile.is_open()) {
		while(!infile.eof()) {
			getline(infile,line);
			file.append(line);
		}		
	} else perror ("Couldn't open the config file");
	infile.close();
	strcpy(buf,file.c_str());
}
char *getConfigfile(char *cbuf) {
	cbuf[0]=0;
	string line;
	string file("");
	char cnf[32];
	char profn[128];
	
	getProject(cnf);
	strcat(strcat(strcpy(profn,CONFIG_PATH),cnf),"/.project.json");
	puts(profn);
	file="";
	ifstream infile2(profn);
	if(infile2.is_open()) {
		while(!infile2.eof()) {
			getline(infile2,line);
			file.append(line);
			file.append(string("\n"));
		}		
	} else perror ("Couldn't open the config file");
	infile2.close();
	strcpy(cbuf,file.c_str());
	puts(cbuf);
	
	return cbuf;	
}
void writefile(char *fn,char *buf) {
	ofstream outfile(fn,ios::trunc | ios::out);
	if(outfile.is_open()) {
		outfile << buf;
	}else perror ("Couldn't save file");
	outfile.close();	
}
int savefile(char *target,char *cmd,char *buf) {
	if(strcmp(target,"savefile")!=0) return 0; // not to os.
	char fn[64];
	strcat(strcpy(fn,SRC_PATH),cmd);
	writefile(fn,buf);
	return 2;
}
int saveproject(char *target,char *cmd,char *buf) {
	if(strcmp(target,"saveproject")!=0) return 0; // not to os.

	char fn[64];
	if(strcmp(buf,"none")!=0) {
		strcat(strcat(strcpy(fn,SRC_PATH),cmd),"/.project.json");
		ofstream outfile(fn,ios::trunc | ios::out);
		if(outfile.is_open()) {
			outfile << buf;
		} else perror ("Couldn't save file");
		outfile.close();
	}
	
	strcat(strcpy(fn,SRC_PATH),"config");
	ofstream outfile2(fn,ios::trunc | ios::out);
	if(outfile2.is_open()) {
		outfile2 << cmd;
	} else perror ("Couldn't save file");
	outfile2.close();

//	puts(fn);
//	puts(buf);
	return 2;
}
int getfiles(char *target,char *cmd,char *b) {
	if(strcmp(target,"files")!=0) return 0; // not to os.

	char buf[1024];
	strcpy(buf,"{files:[");
	DIR *dp;
	struct dirent *ep;
	char dirpath[64];
	
	strcat(strcpy(dirpath,SRC_PATH),cmd);
	dp = opendir (dirpath);
	if (dp != NULL) {
		int first=1;
		while ((ep = readdir (dp))) {
			//puts (ep->d_name);
			if((strcmp(ep->d_name,".")!=0) && (strcmp(ep->d_name,"..")!=0) && (ep->d_type==DT_REG)) {
				char fb[32];
				sprintf(fb,"%s\"%s\"",(!first? ",":""),ep->d_name);
				first=0;
				strcat(buf,fb);
			}
		}
		closedir (dp);
		strcat(buf,"]}");
    } else perror ("Couldn't open the directory");

	ports->send("files",buf);
	return 1;
}
int getprojects(char *target,char *cmd,char *b) {
	if(strcmp(target,"projects")!=0) return 0; // not to os.

	char buf[1024];
	strcpy(buf,"{projects:[");
	DIR *dp;
	struct dirent *ep;
	dp = opendir (SRC_PATH);
	if (dp != NULL) {
		int first=1;
		while ((ep = readdir (dp))) {
			//puts (ep->d_name);
			if((strcmp(ep->d_name,".")!=0) && (strcmp(ep->d_name,"..")!=0) && (ep->d_type==DT_DIR)) {
				char fb[32];
				sprintf(fb,"%s\"%s\"",(!first? ",":""),ep->d_name);
				first=0;
				strcat(buf,fb);
			}
		}
		closedir (dp);
		char cnfbuf[1024];
		char cnf[1060];
		getConfigfile(cnfbuf);
		sprintf(cnf,"],config:%s}",cnfbuf);
		//puts(cnf);
		strcat(buf,cnf);
    } else perror ("Couldn't open the directory");
//	puts(buf);
	ports->send("projects",buf);
	return 1;
}
int newproject(char *target,char *cmd,char *b) {
	if(strcmp(target,"newproject")!=0) return 0; // not to os.
	char dn[64];
	char tp[64];
	char cmdln[128];
	
	strcat(strcpy(dn,SRC_PATH),cmd);
	strcat(strcpy(tp,SRC_PATH),".tmpl/*");
	sprintf(cmdln,"cp %s %s/",tp,dn);
	mkdir(dn, 0755);
	system(cmdln);
	sprintf(cmdln,"{\"current\":\"%s\",\"startscript\":\"loop.js\",\"uiscript\":\"ui.js\"}",cmd);
	strcat(dn,"/.project.json");
	writefile(dn,cmdln);
	return 1;
}

/*
		webd
*/

void init() {
	ports->addListener(&getfiles);
	ports->addListener(&getprojects);
	ports->addListener(&newproject);
	ports->addListener(&savefile);
	ports->addListener(&saveproject);
	ports->addListener(&runscript);
	ports->addListener(&jsControl);
	ports->addListener(&jsDispatcher);
}

void loop() {
	if(script_flag) {
		call_loop();
	}
}

void epilog() {
	if(script_flag) {
		call_epilog();
	}
}




