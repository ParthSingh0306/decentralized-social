// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedSocialMedia {

    struct Profile {
        address userAddress;
        string handle;
        string name;
        string bio;
        string avatar;
        uint256 followerCount;
        uint256 followingCount;
        bool exists;
    }
    
    struct Post {
        address owner;
        string content;
        string imageHash;
        uint256 timestamp;
        uint256 likesCount;
        bool exists;
    }

    struct Comment {
        address author;
        string content;
        uint256 timestamp;
    }

    struct Report {
        address reporter;
        uint256 timestamp;
    }

    struct VoteSession {
        uint256 postId;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool resolved;
        bool exists;
    }

    mapping(address => Profile) public profiles;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment[]) public postComments;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => mapping(address => bool)) public isFollowing;

    mapping(uint256 => Report[]) private reportsByPost;
    mapping(uint256 => VoteSession) public voteSessions;
    mapping(uint256 => mapping(address => bool)) private hasReported;
    mapping(uint256 => mapping(address => bool)) private hasVoted;

    address[] private profileAddresses;

    uint256 public postCount;
    uint256 public constant REPORT_THRESHOLD = 1;
    uint256 public constant VOTE_DURATION = 1 days;

    event ProfileCreated(address indexed user, string handle);
    event ProfileUpdated(address indexed user);
    event Followed(address indexed follower, address indexed followed);
    event Unfollowed(address indexed unfollower, address indexed unfollowed);
    event PostCreated(uint256 indexed postId, address indexed owner);
    event PostUpdated(uint256 indexed postId);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event CommentAdded(uint256 indexed postId, address indexed commenter);
    event PostDeleted(uint256 indexed postId);

    event PostReported(uint256 indexed postId, address indexed reporter);
    event VoteStarted(uint256 indexed postId, uint256 endTime);
    event VoteCast(uint256 indexed postId, address indexed voter, bool isInFavor);
    event VoteResult(uint256 indexed postId, bool postDeleted);

    modifier onlyProfileOwner() {
        require(profiles[msg.sender].exists, "Profile does not exist");
        _;
    }

    modifier validHandle(string memory _handle) {
        require(bytes(_handle).length > 0, "Handle cannot be empty");
        _;
    }

    modifier validPost(uint256 _postId) {
        require(posts[_postId].exists, "Post does not exist");
        _;
    }

    function reportPost(uint256 _postId) external onlyProfileOwner validPost(_postId) {
        require(!hasReported[_postId][msg.sender], "Already reported");
        
        hasReported[_postId][msg.sender] = true;
        reportsByPost[_postId].push(Report(msg.sender, block.timestamp));
        emit PostReported(_postId, msg.sender);

        if(reportsByPost[_postId].length >= REPORT_THRESHOLD && !voteSessions[_postId].exists) {
            voteSessions[_postId] = VoteSession({
                postId: _postId,
                startTime: block.timestamp,
                endTime: block.timestamp + VOTE_DURATION,
                yesVotes: 0,
                noVotes: 0,
                resolved: false,
                exists: true
            });
            emit VoteStarted(_postId, voteSessions[_postId].endTime);
        }
    }

    function castVote(uint256 _postId, bool _isInFavor) external onlyProfileOwner {
        require(voteSessions[_postId].exists, "No active vote");
        require(block.timestamp <= voteSessions[_postId].endTime, "Voting ended");
        require(!hasVoted[_postId][msg.sender], "Already voted");

        hasVoted[_postId][msg.sender] = true;
        
        if(_isInFavor) {
            voteSessions[_postId].yesVotes++;
        } else {
            voteSessions[_postId].noVotes++;
        }
        
        emit VoteCast(_postId, msg.sender, _isInFavor);
    }

    function resolveVote(uint256 _postId) external {
        require(voteSessions[_postId].exists, "No active vote");
        require(!voteSessions[_postId].resolved, "Already resolved");
        require(block.timestamp > voteSessions[_postId].endTime, "Voting ongoing");

        voteSessions[_postId].resolved = true;
        bool deletedPost = voteSessions[_postId].yesVotes > voteSessions[_postId].noVotes;

        if(deletedPost) {
            _deletePost(_postId);
        }
        
        emit VoteResult(_postId, deletedPost);
    }

    function deletePost(uint256 _postId) external validPost(_postId) {
        require(posts[_postId].owner == msg.sender, "Not post owner");
        _deletePost(_postId);
    }

    function _deletePost(uint256 _postId) internal {
        posts[_postId].exists = false;
        emit PostDeleted(_postId);
    }

    function getReportsForPost(uint256 _postId) public view returns (Report[] memory) {
        return reportsByPost[_postId];
    }

    function getVoteSession(uint256 _postId) public view returns (VoteSession memory) {
        return voteSessions[_postId];
    }

    function createProfile(
        string memory _handle,
        string memory _name,
        string memory _bio,
        string memory _avatar
    ) external validHandle(_handle) {
        require(!profiles[msg.sender].exists, "Profile already exists");
        profiles[msg.sender] = Profile({
            userAddress: msg.sender,
            handle: _handle,
            name: _name,
            bio: _bio,
            avatar: _avatar,
            followerCount: 0,
            followingCount: 0,
            exists: true
        });
        profileAddresses.push(msg.sender);
        emit ProfileCreated(msg.sender, _handle);
    }

    function updateProfile(
        string memory _name,
        string memory _bio,
        string memory _avatar
    ) external onlyProfileOwner {
        profiles[msg.sender].name = _name;
        profiles[msg.sender].bio = _bio;
        profiles[msg.sender].avatar = _avatar;
        emit ProfileUpdated(msg.sender);
    }

    function follow(address _toFollow) external onlyProfileOwner {
        require(_toFollow != msg.sender, "Cannot follow yourself");
        require(profiles[_toFollow].exists, "Profile does not exist");
        require(!isFollowing[msg.sender][_toFollow], "Already following");

        isFollowing[msg.sender][_toFollow] = true;
        profiles[msg.sender].followingCount += 1;
        profiles[_toFollow].followerCount += 1;
        emit Followed(msg.sender, _toFollow);
    }

    function unfollow(address _toUnfollow) external onlyProfileOwner {
        require(isFollowing[msg.sender][_toUnfollow], "Not following");

        isFollowing[msg.sender][_toUnfollow] = false;
        profiles[msg.sender].followingCount -= 1;
        profiles[_toUnfollow].followerCount -= 1;
        emit Unfollowed(msg.sender, _toUnfollow);
    }

    function createPost(string memory _content, string memory _imageHash) external onlyProfileOwner {
        postCount += 1;
        posts[postCount] = Post({
            owner: msg.sender,
            content: _content,
            imageHash: _imageHash,
            timestamp: block.timestamp,
            likesCount: 0,
            exists: true
        });
        emit PostCreated(postCount, msg.sender);
    }

    function updatePost(uint256 _postId, string memory _content, string memory _imageHash) external validPost(_postId) {
        require(posts[_postId].owner == msg.sender, "Not post owner");
        Post storage post = posts[_postId];
        post.content = _content;
        post.imageHash = _imageHash;
        emit PostUpdated(_postId);
    }

    function likePost(uint256 _postId) external validPost(_postId) {
        require(!postLikes[_postId][msg.sender], "Already liked");
        postLikes[_postId][msg.sender] = true;
        posts[_postId].likesCount += 1;
        emit PostLiked(_postId, msg.sender);
    }

    function addComment(uint256 _postId, string memory _content) external validPost(_postId) {
        postComments[_postId].push(Comment({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        }));
        emit CommentAdded(_postId, msg.sender);
    }

    function getAllPostIds() public view returns (uint256[] memory) {
        uint256[] memory postIds = new uint256[](postCount);
        for (uint256 i = 0; i < postCount; i++) {
            postIds[i] = i + 1; // Posts start from ID 1
        }
        return postIds;
    }

    function getPostsByUser(address user) public view returns (uint256[] memory) {
         uint256[] memory result = new uint256[](postCount);
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].owner == user && posts[i].exists) {
                result[counter] = i;
                counter++;
            }
        }
        
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            trimmedResult[j] = result[j];
        }
        return trimmedResult;

    }

    function getPostDetails(uint256 postId) public view validPost(postId) returns (
        address owner,
        string memory content,
        string memory imageHash,
        uint256 timestamp,
        uint256 likesCount,
        bool exists
    ) {
         Post storage post = posts[postId];
        return (
            post.owner,
            post.content,
            post.imageHash,
            post.timestamp,
            post.likesCount,
            post.exists
        );
    }

    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 0; i < postCount; i++) {
            allPosts[i] = posts[i + 1]; // IDs start from 1
        }
        return allPosts;
    }
    
    function showAllProfiles() public view returns (Profile[] memory) {
        Profile[] memory allProfiles = new Profile[](profileAddresses.length);
        
        for (uint256 i = 0; i < profileAddresses.length; i++) {
            allProfiles[i] = profiles[profileAddresses[i]];
        }
        return allProfiles;
    }
}