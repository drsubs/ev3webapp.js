
/*
 *		server.cpp
 * 
 * 	Main server processes and initialisation.
 *
 */

#include "server.h"
#include <pthread.h>

int close_testing;
int max_poll_elements;

volatile int force_exit = 0;
struct lws_context *context;
int data_thread_created = 0;
int file_error=0;

pthread_mutex_t lock_established_conns;
pthread_t pthread_port_data;

/* http server gets files from this path */
#define LOCAL_RESOURCE_PATH WWWROOT
const char *resource_path = LOCAL_RESOURCE_PATH;

/*
 * multithreaded version - protect wsi lifecycle changes in the library
 * these are called from protocol 0 callbacks
 */

void server_lock(int care)
{
	if (care)
		pthread_mutex_lock(&lock_established_conns);
}
void server_unlock(int care)
{
	if (care)
		pthread_mutex_unlock(&lock_established_conns);
}

/*
 */

enum demo_protocols {
	/* always first */
	PROTOCOL_HTTP = 0,

	PROTOCOL_PORT_DATA,

	/* always last */
	DEMO_PROTOCOL_COUNT
};

/* list of supported protocols and callbacks */

static struct lws_protocols protocols[] = {
	/* first protocol must always be HTTP handler */

	{
		"http-only",		/* name */
		callback_http,		/* callback */
		sizeof (struct per_session_data__http),	/* per_session_data_size */
		0,			/* max frame size / rx buffer */
	},
	{
		"port-data-protocol",
		callback_port_data,
		sizeof(struct per_session_data__port_data),
		128,
	},
	{ NULL, NULL, 0, 0 } /* terminator */
};
int isMsgque();
void *thread_port_data(void *threadid)
{
	while (!force_exit) {
		/*
		 * 	If isMsgque() returns none zero, there is one or more messages in the que.
		 */
		pthread_mutex_lock(&lock_established_conns);
		
		if(isMsgque()) lws_callback_on_writable_all_protocol(context,&protocols[PROTOCOL_PORT_DATA]);
		
		pthread_mutex_unlock(&lock_established_conns);
		usleep(50000);
	}
	pthread_exit(NULL);
}

void sighandler(int sig)
{
	force_exit = 1;
	lws_cancel_service(context);
}

static struct option options[] = {
	{ "help",	no_argument,		NULL, 'h' },
	{ "debug",	required_argument,	NULL, 'd' },
	{ "port",	required_argument,	NULL, 'p' },
	{ "ssl",	no_argument,		NULL, 's' },
	{ "allow-non-ssl",	no_argument,	NULL, 'a' },
	{ "interface",  required_argument,	NULL, 'i' },
	{ "closetest",  no_argument,		NULL, 'c' },
	{ "libev",  no_argument,		NULL, 'e' },
#ifndef LWS_NO_DAEMONIZE
	{ "daemonize", 	no_argument,		NULL, 'D' },
#endif
	{ "resource_path", required_argument,	NULL, 'r' },
	{ NULL, 0, 0, 0 }
};

void destroyLwsl();
int ws_main(int argc, char **argv)
{
	struct lws_context_creation_info info;
	char interface_name[128] = "";
	const char *iface = NULL;
	//pthread_t pthread_dumb;
	char cert_path[1024];
	char key_path[1024];
 	int debug_level = 7;
	int use_ssl = 0;
//	void *retval;
	int opts = 0;
	int n = 0;
	int syslog_options = LOG_PID | LOG_PERROR;
#ifndef LWS_NO_DAEMONIZE
 	int daemonize = 0;
#endif

	/*
	 * take care to zero down the info struct, he contains random garbaage
	 * from the stack otherwise
	 */
	memset(&info, 0, sizeof info);
	info.port = 7681;

	pthread_mutex_init(&lock_established_conns, NULL);

	while (n >= 0) {
		n = getopt_long(argc, argv, "eci:hsap:d:Dr:", options, NULL);
		if (n < 0)
			continue;
		switch (n) {
		case 'e':
			opts |= LWS_SERVER_OPTION_LIBEV;
			break;
#ifndef LWS_NO_DAEMONIZE
		case 'D':
			daemonize = 1;
			#ifndef _WIN32
			syslog_options &= ~LOG_PERROR;
			#endif
			break;
#endif
		case 'd':
			debug_level = atoi(optarg);
			break;
		case 's':
			use_ssl = 1;
			break;
		case 'a':
			opts |= LWS_SERVER_OPTION_ALLOW_NON_SSL_ON_SSL_PORT;
			break;
		case 'p':
			info.port = atoi(optarg);
			break;
		case 'i':
			strncpy(interface_name, optarg, sizeof interface_name);
			interface_name[(sizeof interface_name) - 1] = '\0';
			iface = interface_name;
			break;
		case 'c':
			close_testing = 1;
			fprintf(stderr, " Close testing mode -- closes on "
					   "client after 50 dumb increments"
					   "and suppresses lws_mirror spam\n");
			break;
		case 'r':
			resource_path = optarg;
			printf("Setting resource path to \"%s\"\n", resource_path);
			break;
		case 'h':
			fprintf(stderr, "Usage: test-server "
					"[--port=<p>] [--ssl] "
					"[-d <log bitfield>] "
					"[--resource_path <path>]\n");
			exit(1);
		}
	}

#if !defined(LWS_NO_DAEMONIZE) 
	/*
	 * normally lock path would be /var/lock/lwsts or similar, to
	 * simplify getting started without having to take care about
	 * permissions or running as root, set to /tmp/.lwsts-lock
	 */
	if (daemonize && lws_daemonize("/tmp/.lwsts-lock")) {
		fprintf(stderr, "Failed to daemonize\n");
		return 1;
	}
#endif

	signal(SIGINT, sighandler);

	/* we will only try to log things according to our debug_level */
	setlogmask(LOG_UPTO (LOG_DEBUG));
	openlog("lwsts", syslog_options, LOG_DAEMON);

	/* tell the library what debug level to emit and to send it to syslog */
	lws_set_log_level(debug_level, lwsl_emit_syslog);

	lwsl_notice("EV3 Development server - "
		    "(C) Copyright 2016 Bo Boye - "
		    "licensed under LGPL2.1\n");

	printf("Using resource path \"%s\"\n", resource_path);

	info.iface = iface;
	info.protocols = protocols;
#ifndef LWS_NO_EXTENSIONS
	info.extensions = lws_get_internal_extensions();
#endif

	info.ssl_cert_filepath = NULL;
	info.ssl_private_key_filepath = NULL;

	if (use_ssl) {
		if (strlen(resource_path) > sizeof(cert_path) - 32) {
			lwsl_err("resource path too long\n");
			return -1;
		}
		sprintf(cert_path, "%s/libwebsockets-test-server.pem",
			resource_path);
		if (strlen(resource_path) > sizeof(key_path) - 32) {
			lwsl_err("resource path too long\n");
			return -1;
		}
		sprintf(key_path, "%s/libwebsockets-test-server.key.pem",
			resource_path);

		info.ssl_cert_filepath = cert_path;
		info.ssl_private_key_filepath = key_path;
	}
	info.gid = -1;
	info.uid = -1;
	info.options = opts;

	context = lws_create_context(&info);
	if (context == NULL) {
		lwsl_err("libwebsocket init failed\n");
		return -1;
	}

	/* start the port data thread */
	data_thread_created = 0;
	n = pthread_create(&pthread_port_data, NULL, thread_port_data, 0);
	if (n) {
		lwsl_err("Unable to create motor status thread\n");
		destroyLwsl();
	}
	data_thread_created = 1;

	return 0;
}
int _pump() {
	return lws_service(context, 50);
}


void destroyLwsl() {
	void *retval;

	/* wait for pthread_port_data to exit */
	if(data_thread_created) pthread_join(pthread_port_data, &retval);

	if(context!=NULL) lws_context_destroy(context);

	pthread_mutex_destroy(&lock_established_conns);

	lwsl_notice("libwebsockets server exited cleanly\n");

	closelog();
}


