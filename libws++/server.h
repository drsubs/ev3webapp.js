#pragma GCC diagnostic ignored "-Wwrite-strings"

#include "lws_config.h"

#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include <signal.h>
#include <string.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <assert.h>
#include <syslog.h>
#include <sys/time.h>
#include <unistd.h>

#include <libwebsockets.h>

extern int close_testing;
extern int max_poll_elements;

extern volatile int force_exit;
extern struct lws_context *context;
extern const char *resource_path;

void server_lock(int care);
void server_unlock(int care);
void findPorts();
void freePortData();
void rescanPorts();


#ifndef __func__
#define __func__ __FUNCTION__
#endif

struct per_session_data__http {
	lws_filefd_type fd;
};

class msgQue;
struct per_session_data__port_data {
	int currPort;
	int msgNum;
	int fragged;
	size_t pbuf;
	char *fragbuf;
	msgQue *msgque;
};

/*
 * one of these is auto-created for each connection and a pointer to the
 * appropriate instance is passed to the callback in the user parameter
 *
 * for this example protocol we use it to individualize the count for each
 * connection.
 */

struct per_session_data__lws_mirror {
	struct lws *wsi;
	int ringbuffer_tail;
};

extern int
callback_http(struct lws *wsi, enum lws_callback_reasons reason, void *user,
	      void *in, size_t len);
extern int
callback_lws_mirror(struct lws *wsi, enum lws_callback_reasons reason,
		    void *user, void *in, size_t len);
extern int
callback_dumb_increment(struct lws *wsi, enum lws_callback_reasons reason,
			void *user, void *in, size_t len);
extern int
callback_port_data	(struct lws *wsi, enum lws_callback_reasons reason,
			void *user, void *in, size_t len);

//extern void
//dump_handshake_info(struct lws *wsi);
