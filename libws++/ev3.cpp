/*
 * Ev3 module.
 * 
 * Ev3 api objects.
 *
 * Sensors: Collect sensors. 
 */
#include <cstring>
#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <cstdio>

#pragma GCC diagnostic ignored "-Wwrite-strings"

#include "ev3.h"

int isMsgque() {
	return ports->isMsgque();
}

Ports *ports;

Port::Port(char *p) {
	portType=PORT_PORT;
	strcpy(path,p);
	readStr(address,"address");
	readStr(driver_name,"driver_name");
}
int Port::write(char const *p,int value) {
	char buf[64];
	ofstream outfile;
	outfile.open(strcat(strcat(strcpy(buf,path),"/"),p));
	if(!outfile.is_open() || !outfile.good()) {
		file_error=1;
		return -1;
	}
	outfile << value << "\n";
	outfile.close();
	return 0;
}
int Port::write(char const *p,char *value) {
	char buf[64];
	ofstream outfile;
	outfile.open(strcat(strcat(strcpy(buf,path),"/"),p));
	if(!outfile.is_open() || !outfile.good()) {
		file_error=1;
		return -1;
	}
	outfile << value << "\n";
	outfile.close();
	return 0;
}
int Port::readInt(char const *p) {
	ifstream infile;
	char buf[64];
	infile.open(strcat(strcat(strcpy(buf,path),"/"),p));
	if(!infile.is_open() || !infile.good()) {
		file_error=1;
		return -1;
	}
	infile >> buf;
	infile.close();
	return atoi(buf);
}
char *Port::readStr(char *buf,char const *p) {
	ifstream infile;
	char b[64];
	buf[0]=0;
	infile.open(strcat(strcat(strcpy(b,path),"/"),p));
	if(!infile.is_open() || !infile.good()) {
		file_error=1;
		return buf;
	}
	int first=1;
	while(infile >> b) {
		if(!first) strcat(buf," ");
		first=0;
		strcat(buf,b);
		}
	infile.close();
	return buf;
}
Ports::Ports() {
}

