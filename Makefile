C++_FLAGS = -Wall -std=gnu++11 -Ilibws++
L_FLAGS = -I/usr/local/include -lpthread -lz -lssl -lcrypto -lwebsockets
C_DEFINES = 
DEPS = js.h libws++/ev3.h
OBJ = startup.o js.o libws++/libws++.a
TARGETS=webd

all: $(TARGETS) libws++/libws++.a

%.o: %.cpp $(DEPS)
	g++ -c -o $@ $< $(C++_FLAGS) $(C_DEFINES)

webd: webd.o $(OBJ)
	g++ -o $@ $^ $(L_FLAGS)

libws++/libws++.a: libws++/ev3.cpp libws++/server.cpp libws++/port-data.cpp libws++/ev3.h libws++/server.h
	cd libws++ ; make
	
clean:
	rm *.o $(TARGETS)


