/*
 * Start up module.
 * 
 * Do the start from main.
 *
*/
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <fstream>
#include <iostream>

#include "ev3.h"

using namespace std;

void loop();
void init();
void epilog();

int main(int argc,char *arg[]) {
	ports=new Ports();

	ws_main(argc,arg);
	
	server_lock(1);
	init();
	server_unlock(1);

	while(!force_exit) {
		_pump();
		loop();
	}
	server_lock(1);
	epilog();
	server_unlock(1);

	destroyLwsl();
	
}


