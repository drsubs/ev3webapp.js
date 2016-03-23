CC=g++
C_FLAGS = -Wall -std=gnu++11 -fvisibility=hidden  -pthread -O3 -DNDEBUG -I/home/robot/libwebsockets-1.6.2/build -I/home/robot/libwebsockets-1.6.2/lib   
C++_FLAGS = -Wall  

L_FLAGS = -I/usr/local/include -lpthread -lz -lssl -lcrypto -lwebsockets
C_DEFINES = -DWWWROOT=\"/home/robot/ws/html\"
DEPS = server.h ev3.h v7.h
OBJ = ev3.o server.o server-http.o port-data.o v7.o

libws++: $(OBJ)
	ar ruv libws++.a $(OBJ) 
	ranlib libws++.a

v7.o: v7.cpp v7.h
	$(CC) -c -o v7.o v7.cpp $(C_FLAGS) $(C_DEFINES)

%.o: %.cpp $(DEPS)
	$(CC) -c -o $@ $< $(C_FLAGS) $(C_DEFINES)


clean:
	rm $(OBJ) libws++.a


