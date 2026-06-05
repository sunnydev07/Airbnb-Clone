const Conversation = require('../models/conversation');
const Listing = require('../models/listing');

module.exports.getInbox = async (req, res) => {
    const conversations = await Conversation.find({
        participants: req.user._id
    })
    .populate('participants')
    .populate('listing')
    .sort({ updatedAt: -1 });

    res.render('messages/inbox', { conversations });
};

module.exports.getConversation = async (req, res) => {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
        .populate('participants')
        .populate('listing');

    if (!conversation || !conversation.participants.some(p => p._id.equals(req.user._id))) {
        req.flash('error', 'Conversation not found!');
        return res.redirect('/messages');
    }

    // Mark messages from other participants as read
    let updated = false;
    conversation.messages.forEach(msg => {
        if (!msg.sender.equals(req.user._id) && !msg.read) {
            msg.read = true;
            updated = true;
        }
    });

    if (updated) {
        await conversation.save();
    }

    res.render('messages/conversation', { conversation });
};

module.exports.sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        req.flash('error', 'Message cannot be empty!');
        return res.redirect(`/messages/${conversationId}`);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.equals(req.user._id))) {
        req.flash('error', 'Conversation not found!');
        return res.redirect('/messages');
    }

    conversation.messages.push({
        sender: req.user._id,
        content: content.trim(),
        read: false
    });
    conversation.updatedAt = new Date();

    await conversation.save();
    res.redirect(`/messages/${conversationId}`);
};

module.exports.startConversation = async (req, res) => {
    const { id } = req.params; // listing id
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash('error', 'You cannot contact yourself!');
        return res.redirect(`/listings/${id}`);
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
        listing: listing._id,
        participants: { $all: [req.user._id, listing.owner] }
    });

    if (!conversation) {
        conversation = new Conversation({
            participants: [req.user._id, listing.owner],
            listing: listing._id,
            messages: [
                {
                    sender: req.user._id,
                    content: `Hi! I am interested in your listing: "${listing.title}".`
                }
            ],
            updatedAt: new Date()
        });
        await conversation.save();
    }

    res.redirect(`/messages/${conversation._id}`);
};
