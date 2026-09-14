import mongoose from "mongoose";
import SupportTicket from "../models/SupportTicket.js";
import SupportMessage from "../models/SupportMessage.js";
import Notification from "../models/Notification.js";

const sanitizeText=v=>String(v??"").trim();
const STATUSES=["open","in-progress","resolved","closed"];
const validateCategory=c=>["course","payment","video","certificate","account","other"].includes(c)?c:"other";
const validatePriority=p=>["low","medium","high","urgent"].includes(p)?p:"medium";
const validateId=id=>{if(!mongoose.Types.ObjectId.isValid(id)){const e=new Error("Invalid support ticket id.");e.statusCode=400;throw e;}};
const serializeMessage=m=>({id:m._id?.toString(),sender:m.sender?{id:m.sender._id?.toString(),name:m.sender.name,email:m.sender.email,avatar:m.sender.avatar||""}:null,senderRole:m.senderRole,message:m.message,createdAt:m.createdAt});
const serializeTicket=(t,messages=[],lastMessage=null)=>({id:t._id?.toString(),subject:t.subject,category:t.category,message:t.message,status:t.status,priority:t.priority,adminReply:t.adminReply||"",repliedAt:t.repliedAt||null,createdAt:t.createdAt,updatedAt:t.updatedAt,lastMessage:messages.length?messages[messages.length-1]:lastMessage,messages});

export const createSupportTicket=async({userId,subject,category,message,priority})=>{const cleanSubject=sanitizeText(subject),cleanMessage=sanitizeText(message);if(cleanSubject.length<3||cleanSubject.length>200){const e=new Error("Subject must be between 3 and 200 characters.");e.statusCode=400;throw e;}if(cleanMessage.length<10||cleanMessage.length>5000){const e=new Error("Message must be between 10 and 5000 characters.");e.statusCode=400;throw e;}const ticket=await SupportTicket.create({user:userId,subject:cleanSubject,category:validateCategory(category),message:cleanMessage,priority:validatePriority(priority)});await SupportMessage.create({ticket:ticket._id,sender:userId,senderRole:"user",message:cleanMessage});return serializeTicket(ticket,[]);};

export const getUserSupportTickets=async({userId,status})=>{const filter={user:userId};if(STATUSES.includes(status))filter.status=status;const tickets=await SupportTicket.find(filter).sort({updatedAt:-1}).lean();const ids=tickets.map(t=>t._id);const latest=ids.length?await SupportMessage.find({ticket:{$in:ids}}).sort({createdAt:-1}).lean():[];const map=new Map();for(const m of latest)if(!map.has(m.ticket.toString()))map.set(m.ticket.toString(),serializeMessage(m));return tickets.map(t=>serializeTicket(t,[],map.get(t._id.toString())));};

export const getUserSupportTicket=async({userId,ticketId})=>{validateId(ticketId);const ticket=await SupportTicket.findOne({_id:ticketId,user:userId}).lean();if(!ticket){const e=new Error("Support ticket not found.");e.statusCode=404;throw e;}const messages=await SupportMessage.find({ticket:ticket._id}).populate({path:"sender",select:"name email avatar"}).sort({createdAt:1}).lean();return serializeTicket(ticket,messages.map(serializeMessage));};

export const replyToSupportTicket=async({userId,ticketId,message})=>{validateId(ticketId);const cleanMessage=sanitizeText(message);if(cleanMessage.length<1||cleanMessage.length>5000){const e=new Error("Reply must be between 1 and 5000 characters.");e.statusCode=400;throw e;}const ticket=await SupportTicket.findOne({_id:ticketId,user:userId});if(!ticket){const e=new Error("Support ticket not found.");e.statusCode=404;throw e;}if(ticket.status==="closed"){const e=new Error("Closed tickets cannot receive new replies.");e.statusCode=400;throw e;}await SupportMessage.create({ticket:ticket._id,sender:userId,senderRole:"user",message:cleanMessage});ticket.status="open";await ticket.save();await Notification.create({user:userId,title:`Support reply sent: ${ticket.subject}`,message:"Your message was added to the support conversation.",type:"system",link:"/dashboard/support"});return getUserSupportTicket({userId,ticketId});};
