import threading
import time 

# EXAMPLE 1
    
# class Multithreading():
#     def __init__(self):
#         pass
        
#     def start(self):
#         for i in range(5):
#             print(i)
#             time.sleep(1)

# # Instantiate two objects of the Multithreading class
# thread1 = Multithreading()
# thread2 = Multithreading()

# # Create threads and start them, associating each with the start method of the corresponding object
# thread_instance1 = threading.Thread(target=thread1.start)
# thread_instance2 = threading.Thread(target=thread2.start)

# thread_instance1.start()

# thread_instance2.start()

# # Main Thread Wait for both threads to finish before goes beyond
# thread_instance1.join()
# thread_instance2.join()


# # EXAMPLE 2
# class Multithreading():
#     def __init__(self,id):
#         self.thread_id  = id

#     def start(self):
#         for i in range(5):
#             print(f"{i} from thread number {self.thread_id} " )
#             time.sleep(1)

# # Instantiate two objects of the Multithreading class
# for i in range(5):
#     thread1 = Multithreading(i)
#     thread_instance1 = threading.Thread(target=thread1.start)
#     thread_instance1.start()
#     thread_instance1.join()


# Create threads and start them, associating each with the start method of the corresponding object




# EXAMPLE 3
# Multiple Threading with Lock()

class Stack:
    def __init__(self, capacity):
        self.array = [0] * capacity
        self.stack_top = -1
        self.lock = threading.Lock()

    def push(self, ele):
        with self.lock:
            if self.stack_top == len(self.array) - 1:
                return False

            self.stack_top += 1
            time.sleep(1)  # Simulate some work
            self.array[self.stack_top] = ele
            return True

    def pop(self):
        with self.lock:
            if self.stack_top < 0:
                return False

            time.sleep(2)  # Simulate some work
            self.stack_top -= 1
            return True

def main():
    stack = Stack(5)

    def pusher():
        counter = 0
        while counter < 10:
            if stack.push(counter):
                print(f"Pushed: {counter}")
                counter += 1
            else:
                print("Stack is full")

    def popper():
        counter = 0
        while counter < 10:
            if stack.pop():
                print("Popped")
                counter += 1
            else:
                print("Stack is empty")

    pusher_thread = threading.Thread(target=pusher, name="Pusher")
    popper_thread = threading.Thread(target=popper, name="Popper")

    pusher_thread.start()
    popper_thread.start()

    # pusher_thread.join()
    # popper_thread.join()

if __name__ == "__main__":
    main()

# EXAMPLE 4 
# Multiple Threading with Producer/Consumer Problem
import queue


import threading

class MyMutex:
    def __init__(self):
        self.condition = threading.Condition()
        self.is_locked = False

    def acquire(self):
        with self.condition:
            while self.is_locked:
                self.condition.wait()
            self.is_locked = True

    def release(self):
        with self.condition:
            self.is_locked = False
            self.condition.notify()


class BlockingQueue:

    def __init__(self,cap):
        self.q = queue.Queue()
        self.cap = cap
        self.mutex = MyMutex()
        self.stop_flag = threading.Event()

    
    def add(self, item):
         while not self.stop_flag.is_set():
            self.mutex.acquire()
            try:
                while self.q.qsize() >= self.cap:
                    print("Queue is full, waiting...")
                    self.mutex.release()
                    time.sleep(1)
                    self.mutex.acquire()

                self.q.put(item)
                print(f"Added: {item}")
            finally:
                self.mutex.release()

    def remove_item(self):
        while not self.stop_flag.is_set():
            self.mutex.acquire()
            try:
                if not self.q.empty() and self.q.qsize()<self.cap:
                    item = self.q.get()
                    print(f"Removed: {item}")
                    self.mutex.release()
                                
                else:
                    print("Queue is empty, cannot remove more items.")
                    time.sleep(1)

            finally:
                self.mutex.release()

    def stop(self):
        self.stop_flag.is_set()
        self.mutex.acquire()
        self.mutex.release()

    def producer(self):
        for i in range(5):
            data = f"Data {i}"
            self.add(data)
            time.sleep(1)

    def consumer(self):
        for i in range(3):
            self.remove_item()
            time.sleep(1)

# Create an instance of Queue
my_queue_manager = BlockingQueue(3)

# Create producer and consumer threads
producer_thread = threading.Thread(target=my_queue_manager.producer)
producer_thread2 = threading.Thread(target=my_queue_manager.producer)
consumer_thread = threading.Thread(target=my_queue_manager.consumer)

# Start the threads
producer_thread.start()
producer_thread2.start()
consumer_thread.start()

# Wait for the producer to finish producing
producer_thread.join()
producer_thread2.join()
# Wait for the consumer to finish consuming
consumer_thread.join()


my_queue_manager.stop()
