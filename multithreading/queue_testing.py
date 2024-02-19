from example_thread import BlockingQueue
import threading
import unittest

class TestBlockingQueue(unittest.TestCase):

    def test_producer_consumer(self):
        my_queue_manager = BlockingQueue(4)

        producer_thread = threading.Thread(target=my_queue_manager.producer)
        consumer_thread = threading.Thread(target=my_queue_manager.consumer)

        producer_thread.start()
        consumer_thread.start()

        producer_thread.join()
        consumer_thread.join()

        # Ensure the queue is empty after the test
        self.assertTrue(my_queue_manager.q.empty())

    def test_capacity(self):
        my_queue_manager = BlockingQueue(2)

        # Add more items than the capacity
        my_queue_manager.add("Item 1")
        my_queue_manager.add("Item 2")
        my_queue_manager.add("Item 3")

        # Ensure only two items are in the queue
        self.assertEqual(my_queue_manager.q.qsize(), 2)

    def test_remove_item(self):
        my_queue_manager = BlockingQueue(3)

        # Add items to the queue
        my_queue_manager.add("Item 1")
        my_queue_manager.add("Item 2")

        # Remove an item from the queue
        my_queue_manager.remove_item()

        # Ensure the item is removed
        self.assertEqual(my_queue_manager.q.qsize(), 1)

if __name__ == '__main__':
    unittest.main()