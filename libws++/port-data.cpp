/*


 */
using namespace std;

//#include "server.h"
#include "ev3.h"
#include <string.h>


/* Port Data protocol */
/*
 *
 *	Send port status polled from a tread timer loop.
 *
 */

int port_data_handshake_info(struct lws *wsi) { 
	return 0; 
}
int callback_port_data(struct lws *wsi, enum lws_callback_reasons reason,
			void *user, void *in, size_t len)
{
	size_t remaining;
	unsigned char buf[LWS_SEND_BUFFER_PRE_PADDING + 512 +
						  LWS_SEND_BUFFER_POST_PADDING];
	struct per_session_data__port_data *psd =
			(struct per_session_data__port_data *)user;
	unsigned char *p = &buf[LWS_SEND_BUFFER_PRE_PADDING];
	int m, l=0;

	switch (reason) {

	case LWS_CALLBACK_CLOSED:
		ports->removePsd(psd);
		break;
		
	case LWS_CALLBACK_ESTABLISHED:
		//findPorts();
		psd->currPort=0;
		psd->msgNum=0;
		psd->pbuf=0;
		psd->fragged=0;
		psd->msgque = new msgQue();
		ports->addPsd(psd);
		break;

	case LWS_CALLBACK_SERVER_WRITEABLE:
//			puts("Call ports msg");
			l = ports->msg((char*)p,psd);
//			printf("After ports->msg : %s\n",p);
//			lwsl_notice((char*)p);
			if(l>0) {
				m = lws_write(wsi, p, l, LWS_WRITE_TEXT);
				if (m < l) {
					lwsl_err("ERROR writing to di socket\n");
					return -1;
				}
			}
		break;

	case LWS_CALLBACK_RECEIVE:
		remaining = lws_remaining_packet_payload(wsi);

		if((!remaining) && (!psd->fragged)) {
			*((char*)in+len+1)=0;
			ports->dispatch((char*) in);
		}
		
		if((remaining) && (psd->fragged)) {
			psd->fragbuf=(char*)realloc((void*)psd->fragbuf,psd->pbuf+len);
			memcpy((void*)(psd->fragbuf+psd->pbuf),in,len);
			psd->pbuf+=len;
		}
		if((remaining) && (!psd->fragged)) {
			psd->fragged=1;
			psd->fragbuf=(char*)malloc(len);
			memcpy((void*)psd->fragbuf,in,len);
			psd->pbuf+=len;
		}
		if((!remaining) && (psd->fragged)) {
			psd->fragbuf=(char*)realloc((void*)psd->fragbuf,psd->pbuf+len+1);
			memcpy((void*)(psd->fragbuf+psd->pbuf),in,len);
			psd->pbuf+=len;
			psd->fragbuf[psd->pbuf]=0;
			ports->dispatch((char*) psd->fragbuf);
			free(psd->fragbuf);
			psd->pbuf=0;
			psd->fragged=0;
		}
		
		break;
		
	/*
	 * this just demonstrates how to use the protocol filter. If you won't
	 * study and reject connections based on header content, you don't need
	 * to handle this callback
	 */
	case LWS_CALLBACK_FILTER_PROTOCOL_CONNECTION:
		port_data_handshake_info(wsi);
		/* you could return non-zero here and kill the connection */
		break;

	default:
		break;
	}

	return 0;
}


