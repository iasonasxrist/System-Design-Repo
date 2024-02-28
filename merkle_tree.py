import hashlib

class MerkleNode:
    def __init__(self, hash_value=None):
        self.hash_value = hash_value
        self.left = None
        self.right = None

def sha256(data):
    """Compute SHA-256 hash of the data."""
    sha = hashlib.sha256()
    sha.update(data)
    return sha.digest()

def construct_merkle_tree(data):
    """Construct a Merkle tree from a dictionary of key-value pairs."""
    if len(data) == 0:
        return None

    # Convert dictionary to list of key-value pairs sorted by key
    sorted_data = sorted(data.items(), key=lambda x: x[0])

    # Recursively construct the tree
    leaf_nodes = [MerkleNode(sha256(f"{key}:{value}".encode())) for key, value in sorted_data]
    tree = _construct_tree(leaf_nodes)
    return tree

def _construct_tree(nodes):
    """Helper function to recursively construct the Merkle tree."""
    if len(nodes) == 1:
        return nodes[0]

    parent_nodes = []
    
    for i in range(0, len(nodes), 2):
        left = nodes[i]
        right = nodes[i+1] if i+1 < len(nodes) else None
        parent_hash = left.hash_value if right is None else sha256(left.hash_value + right.hash_value)
        parent = MerkleNode(parent_hash)
        parent.left = left
        parent.right = right
        parent_nodes.append(parent)
    print(parent_nodes)
    return _construct_tree(parent_nodes)

def merkle_root(tree):
    """Return the root hash of the Merkle tree."""
    return tree.hash_value if tree else None

# Example key-value database
database = {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3",
    "key4": "value4"
}

# Construct the Merkle tree
merkle_tree = construct_merkle_tree(database)

# Get the Merkle root
root_hash = merkle_root(merkle_tree)

# Print the root hash
# print("Merkle Root:", root_hash.hex())
def compare_databases(db1, db2):
    """Compare two databases using Merkle trees."""
    # Construct Merkle trees for both databases
    merkle_tree1 = construct_merkle_tree(db1)
    merkle_tree2 = construct_merkle_tree(db2)

    # Get the root hashes of the Merkle trees
    root_hash1 = merkle_root(merkle_tree1)
    root_hash2 = merkle_root(merkle_tree2)

    # Compare the root hashes
    if root_hash1 != root_hash2:
        print("Databases have diverged due to different writes")
        # Optionally, further analysis can be done to identify specific differences
    else:
        print("Databases are in sync")

# Example databases
database1 = {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
}

database2 = {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3",
    "key4": "value4"  # Different write in database2
}

# Compare the databases
compare_databases(database1, database2)
