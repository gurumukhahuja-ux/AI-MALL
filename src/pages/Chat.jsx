import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Trash2, Clock, Video, Mic, Image as ImageIcon, FileText, Camera, X, Copy, ThumbsUp, ThumbsDown, Share2, Download, Share, Check, MessageSquare, Pencil, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateChatResponse } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import Loader from '../Components/Loader/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { renderToStaticMarkup } from 'react-dom/server';
import { jsPDF } from "jspdf";

const Chat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
  const [attachments, setAttachments] = useState([]); // Array of { type: 'image' | 'file', content: string | File, url: string, name: string }
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessageContent, setShareMessageContent] = useState(null); // Track specific message to share
  const [isExporting, setIsExporting] = useState(false);
  const [showLiveAI, setShowLiveAI] = useState(false);
  const [liveAIResponse, setLiveAIResponse] = useState('');
  const [isLiveAIProcessing, setIsLiveAIProcessing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' or 'environment'
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const liveVideoRef = useRef(null);
  const liveRecognitionRef = useRef(null);
  const [feedbackText, setFeedbackText] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        console.log(`📎 Attaching: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
        setAttachments(prev => [...prev, {
          type,
          content: reader.result,
          name: file.name,
          mimeType: file.type // Preserve MIME type for backend
        }]);
      };
      reader.readAsDataURL(file);
    });
    setShowAttachMenu(false);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            setAttachments(prev => [...prev, { type, content: reader.result, name: file.name || `pasted_file_${Date.now()}` }]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const type = file.type.startsWith('image/') ? 'image' : 'file';
          setAttachments(prev => [...prev, {
            type,
            content: reader.result,
            name: file.name,
            mimeType: file.type || 'application/octet-stream'
          }]);
          toast.success(`Attached ${file.name}`);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCameraClick = async () => {
    setShowAttachMenu(false);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setAttachments(prev => [...prev, { type: 'image', content: dataUrl, name: `photo_${Date.now()}.jpg` }]);

      const stream = videoRef.current.srcObject;
      stream?.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Capture text present before voice input starts
    const initialText = inputValue;

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      let voiceTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        voiceTranscript += event.results[i][0].transcript;
      }
      const transcript = voiceTranscript;

      const lowerTranscript = transcript.toLowerCase().trim();

      // Check for various "send" commands at the end of the sentence
      const sendCommandPattern = /(?:send|sent)\s*(?:it|message|this|now|text)?[\.\!\?]*\s*$/i;

      if (sendCommandPattern.test(lowerTranscript)) {
        // Remove the command and any trailing punctuation
        const cleanVoiceText = transcript.replace(sendCommandPattern, '').trim();
        const finalContent = initialText + (initialText && !initialText.endsWith(' ') ? ' ' : '') + cleanVoiceText;

        // Only send if there is actual content
        if (finalContent.trim().length > 0) {
          setIsListening(false);
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
          setInputValue('');
          handleSendMessage(null, finalContent);
          return;
        }
      }

      const combinedText = initialText + (initialText && !initialText.endsWith(' ') ? ' ' : '') + voiceTranscript;
      setInputValue(combinedText);
      const ta = document.querySelector('textarea');
      if (ta) {
        ta.style.height = '60px';
        ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    const loadSessions = async () => {
      const data = await chatStorageService.getSessions();
      setSessions(data);
    };
    loadSessions();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      // Reset inputs when switching sessions
      if (sessionId !== currentSessionIdRef.current) {
        setInputValue('');
        setAttachments([]);
      }

      if (sessionId && sessionId !== 'new') {
        setCurrentSessionId(sessionId);
        const history = await chatStorageService.getHistory(sessionId);

        // Only overwrite if the current state is empty OR if we're loading a DIFFERENT session
        // This prevents the "flash and vanish" issue when navigating after first message
        setMessages(prev => {
          if (prev.length > 0 && sessionId === currentSessionIdRef.current) {
            return prev;
          }
          return history;
        });
      } else {
        setCurrentSessionId('new');
        setMessages([]);
      }
      setShowHistory(false);
    };
    initChat();
  }, [sessionId]);

  // Keep track of session ID to compare in effects
  const currentSessionIdRef = useRef(currentSessionId);
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Copied to clipboard", {
        icon: '📋',
        style: {
          borderRadius: '12px',
          background: '#000',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '900',
          letterSpacing: '0.05em'
        }
      });
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleAction = (type, arg1, arg2) => {
    if (type === 'like' || type === 'dislike') {
      const msgId = arg1;
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          const newFeedback = m.feedback === type ? null : type;
          if (newFeedback === 'like') {
            toast.success("Thanks for the feedback!", {
              icon: '👍',
              style: { borderRadius: '12px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: '900' }
            });
          } else if (newFeedback === 'dislike') {
            setShowFeedbackModal(true);
          }
          return { ...m, feedback: newFeedback };
        }
        return m;
      }));
    } else if (type === 'share') {
      const msgContent = arg1;
      const msgTimestamp = arg2;
      // Save the specific message content for export
      if (msgContent) {
        setShareMessageContent({ content: msgContent, timestamp: msgTimestamp });
      } else {
        setShareMessageContent(null); // Will export all messages
      }
      setShowShareModal(true);
    } else if (type === 'report') {
      toast.success("Report submitted!", { icon: '🚩', style: { borderRadius: '12px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: '900' } });
    }
  };

  // Export single message as PDF
  const handleExportSingleMessage = (content, timestamp) => {
    // Render Markdown to HTML string
    const renderedHTML = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            background-color: #525659;
            margin: 0;
            padding: 40px 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            font-family: 'Times New Roman', Times, serif;
          }
          
          .page {
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            padding: 25mm;
            box-shadow: 0 0 15px rgba(0,0,0,0.3);
            position: relative;
          }

          .meta { text-align: right; margin-bottom: 2em; font-size: 11pt; color: #000; }
          .content { font-size: 12pt; line-height: 1.5; text-align: justify; text-justify: inter-word; color: #000; }
          
          h1, h2, h3, h4 { color: #000; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: bold; line-height: 1.2; text-align: left; }
          h1 { font-size: 16pt; border-bottom: 1px solid #000; padding-bottom: 0.2em; }
          h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 0.2em; }
          h3 { font-size: 13pt; }
          p { margin-bottom: 1em; }
          ul, ol { margin-left: 2em; margin-bottom: 1em; }
          li { margin-bottom: 0.4em; }
          strong { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #000; padding: 0.5em; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          blockquote { border-left: 3px solid #000; padding-left: 1em; margin-left: 0; margin-bottom: 1em; font-style: italic; }
          code { font-family: 'Courier New', Courier, monospace; background: #f5f5f5; padding: 2px 4px; }
          pre { font-family: 'Courier New', Courier, monospace; background: #f5f5f5; padding: 1em; border: 1px solid #ddd; overflow-x: auto; margin-bottom: 1em; }

          @media print { 
            body { background: none; padding: 0; display: block; }
            .page { width: 100%; min-height: auto; box-shadow: none; margin: 0; padding: 0; }
            @page { margin: 25mm 25mm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="meta">
            Date: ${new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div class="content">${renderedHTML}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      toast.success("Print dialog opened! Save as PDF", { icon: '📄' });
    }, 500);
  };

  const handleExportPDF = async (mode = 'download') => {
    // Check if we're exporting a single message or all messages
    const isSingleMessage = shareMessageContent !== null;

    if (!isSingleMessage && messages.length === 0) return;
    setIsExporting(true);

    // Determine what content to export
    const exportContent = isSingleMessage
      ? shareMessageContent.content
      : null;
    const exportTimestamp = isSingleMessage
      ? shareMessageContent.timestamp
      : null;

    // If single message, use the single message export template
    if (isSingleMessage) {
      // Render Markdown to HTML string
      const renderedHTML = renderToStaticMarkup(
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {exportContent}
        </ReactMarkdown>
      );

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            background-color: #525659;
            margin: 0;
            padding: 40px 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            font-family: 'Times New Roman', Times, serif;
          }
          
          .page {
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            padding: 25mm;
            box-shadow: 0 0 15px rgba(0,0,0,0.3);
            position: relative;
          }

          .meta { text-align: right; margin-bottom: 2em; font-size: 11pt; color: #000; }
          .content { font-size: 12pt; line-height: 1.5; text-align: justify; text-justify: inter-word; color: #000; }
          
          h1, h2, h3, h4 { color: #000; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: bold; line-height: 1.2; text-align: left; }
          h1 { font-size: 16pt; border-bottom: 1px solid #000; padding-bottom: 0.2em; }
          h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 0.2em; }
          h3 { font-size: 13pt; }
          p { margin-bottom: 1em; }
          ul, ol { margin-left: 2em; margin-bottom: 1em; }
          li { margin-bottom: 0.4em; }
          strong { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #000; padding: 0.5em; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          blockquote { border-left: 3px solid #000; padding-left: 1em; margin-left: 0; margin-bottom: 1em; font-style: italic; }
          code { font-family: 'Courier New', Courier, monospace; background: #f5f5f5; padding: 2px 4px; }
          pre { font-family: 'Courier New', Courier, monospace; background: #f5f5f5; padding: 1em; border: 1px solid #ddd; overflow-x: auto; margin-bottom: 1em; }

          @media print { 
            body { background: none; padding: 0; display: block; }
            .page { width: 100%; min-height: auto; box-shadow: none; margin: 0; padding: 0; }
            @page { margin: 25mm 25mm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="meta">
            Date: ${new Date(exportTimestamp || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div class="content">${renderedHTML}</div>
        </div>
      </body>
      </html>
    `;

      if (mode === 'download' || mode === 'open') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        if (mode === 'download') {
          setTimeout(() => {
            printWindow.print();
            toast.success("Print dialog opened! Save as PDF");
          }, 500);
        } else {
          toast.success("Preview opened!");
        }
      } else if (mode === 'share') {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const fileName = `AISA_Response_${Date.now()}.html`;

        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: 'text/html' });
            const shareData = { files: [file], title: 'AISA Response' };

            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              toast.success("Shared successfully!");
            } else {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("File downloaded!");
            }
          } catch (err) {
            if (err.name !== 'AbortError') {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("File downloaded!");
            }
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("File downloaded!");
        }
      }

      setIsExporting(false);
      setShowShareModal(false);
      setShareMessageContent(null);
      return;
    }

    // Full conversation export - Clean PROFESSIONAL document-style PDF (no cards, just text)
    const htmlContent = `
          < !DOCTYPE html >
            <html>
              <head>
                <meta charset="UTF-8">
                  <title>AISA - Conversation Transcript</title>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Georgia&display=swap');

                    * {margin: 0; padding: 0; box-sizing: border-box; }

                    body {
                      font - family: Georgia, 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.8;
                    color: #000;
                    background: #fff;
                    padding: 60px 80px;
                    max-width: 800px;
                    margin: 0 auto;
          }

                    /* Document Header */
                    .doc-header {
                      text - align: center;
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 2px solid #000;
          }
                    .doc-title {
                      font - size: 24pt;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
          }
                    .doc-subtitle {
                      font - size: 12pt;
                    color: #444;
                    font-style: italic;
          }
                    .doc-meta {
                      margin - top: 20px;
                    font-size: 10pt;
                    color: #666;
          }

                    /* Conversation Section */
                    .conversation {
                      margin - top: 30px;
          }
                    .section-title {
                      font - size: 14pt;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 25px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #999;
          }

                    /* Message Entry */
                    .entry {
                      margin - bottom: 30px;
                    page-break-inside: avoid;
          }
                    .speaker {
                      font - weight: bold;
                    font-size: 11pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
          }
                    .speaker-user {color: #333; }
                    .speaker-ai {color: #000; }
                    .timestamp {
                      font - size: 9pt;
                    color: #888;
                    font-style: italic;
                    margin-left: 10px;
                    font-weight: normal;
          }
                    .content {
                      font - size: 11pt;
                    line-height: 1.9;
                    text-align: justify;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin-left: 0;
          }
                    .separator {
                      border: none;
                    border-top: 1px dashed #ccc;
                    margin: 25px 0;
          }

                    /* Footer */
                    .doc-footer {
                      margin - top: 50px;
                    padding-top: 20px;
                    border-top: 2px solid #000;
                    text-align: center;
                    font-size: 9pt;
                    color: #666;
          }
                    .footer-brand {
                      font - weight: bold;
                    font-size: 10pt;
                    letter-spacing: 1px;
                    margin-bottom: 5px;
          }

                    @media print {
                      body {padding: 40px 60px; }
          }
                  </style>
              </head>
              <body>
                <div class="doc-header">
                  <div class="doc-title">Conversation Transcript</div>
                  <div class="doc-subtitle">AISA™ — AI-MALL Intelligence System</div>
                  <div class="doc-meta">
                    <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;|&nbsp;
                    <strong>Total Messages:</strong> ${messages.length}
                  </div>
                </div>

                <div class="conversation">
                  <div class="section-title">Transcript</div>

                  ${messages.map((msg, idx) => `
            <div class="entry">
              <div class="speaker ${msg.role === 'user' ? 'speaker-user' : 'speaker-ai'}">
                ${msg.role === 'user' ? 'USER' : 'AISA (AI Assistant)'}
                <span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div class="content">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
            ${idx < messages.length - 1 ? '<hr class="separator">' : ''}
          `).join('')}
                </div>

                <div class="doc-footer">
                  <div class="footer-brand">AI-MALL™</div>
                  Powered by Unified Web Options & Services (UWO)<br>
                    This document was automatically generated by AISA Intelligence System.<br>
                      © ${new Date().getFullYear()} All Rights Reserved.
                    </div>
                  </body>
                </html>
                `;

    if (mode === 'download' || mode === 'open') {
      // Open in new window for print/save as PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      if (mode === 'download') {
        setTimeout(() => {
          printWindow.print();
          toast.success("Print dialog opened! Save as PDF");
        }, 500);
      } else {
        toast.success("Preview opened!");
      }
    } else if (mode === 'share') {
      // Create blob for sharing
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = `AISA_Chat_${Date.now()}.html`;

      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], fileName, { type: 'text/html' });
          const shareData = { files: [file], title: 'AISA Chat Transcript' };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            toast.success("Shared successfully!");
          } else {
            // Fallback: download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("File downloaded!");
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("File downloaded!");
          }
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("File downloaded!");
      }
    }

    setIsExporting(false);
    setShowShareModal(false);
  };

  // Live AI Video Call Functions
  const handleStartLiveAI = async () => {
    setShowLiveAI(true);
    setLiveAIResponse('');
    setIsVideoPaused(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false
      });

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }

      toast.success("Live AI activated! Ask me anything.", { icon: '🎥' });
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera. Please check permissions.");
      setShowLiveAI(false);
    }
  };

  const handleStopLiveAI = () => {
    if (liveVideoRef.current?.srcObject) {
      const tracks = liveVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }

    if (liveRecognitionRef.current) {
      liveRecognitionRef.current.stop();
    }

    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    setShowLiveAI(false);
    setLiveAIResponse('');
    setIsLiveAIProcessing(false);
    setIsVideoPaused(false);
  };

  const handleSwitchCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);

    if (liveVideoRef.current?.srcObject) {
      const tracks = liveVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: false
      });

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera switch error:", err);
      toast.error("Could not switch camera");
    }
  };

  const handleToggleVideoPause = () => {
    if (liveVideoRef.current?.srcObject) {
      const videoTrack = liveVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoPaused;
        setIsVideoPaused(!isVideoPaused);
      }
    }
  };

  const handleLiveAIQuestion = async () => {
    // Always stop any ongoing speech when interaction starts/toggles
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    // Toggle Logic: If already listening/processing, stop everything
    if (isLiveAIProcessing) {
      if (liveRecognitionRef.current) {
        liveRecognitionRef.current.stop();
        liveRecognitionRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsLiveAIProcessing(false);
      setLiveAIResponse("Listening stopped.");
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported on this device");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    liveRecognitionRef.current = new SpeechRecognition();
    liveRecognitionRef.current.continuous = false;
    liveRecognitionRef.current.interimResults = false;
    liveRecognitionRef.current.lang = 'en-US';

    setIsLiveAIProcessing(true);
    setLiveAIResponse('Listening...');

    liveRecognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setLiveAIResponse(`You asked: "${transcript}"\n\nThinking...`);

      try {
        // Capture current frame from video
        let imageData = null;
        if (liveVideoRef.current && !isVideoPaused) {
          const canvas = document.createElement('canvas');
          canvas.width = liveVideoRef.current.videoWidth;
          canvas.height = liveVideoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(liveVideoRef.current, 0, 0);
          imageData = canvas.toDataURL('image/jpeg', 0.8);
        }

        const attachment = imageData ? [{
          type: 'image',
          content: imageData,
          name: 'live_capture.jpg'
        }] : [];

        const response = await generateChatResponse(
          [],
          transcript,
          "You are AISA, participating in a live video call. You are seeing the user and their surroundings through their camera. Answer naturally as if you are looking at them. Do not refer to 'the image provided' or 'uploaded image'; instead say 'I see' or describe what is happening in the video feed directly. Be conversational, helpful, and concise.",
          attachment
        );
        setLiveAIResponse(response);

        // Speak the response using Text-to-Speech
        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(response);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Track speaking state for visualizer
          utterance.onstart = () => setIsAiSpeaking(true);
          utterance.onend = () => setIsAiSpeaking(false);
          utterance.onerror = () => setIsAiSpeaking(false);

          // Try to use a nice voice
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'));
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error("AI response error:", err);
        setLiveAIResponse("Sorry, I couldn't process that. Please try again.");
      }

      setIsLiveAIProcessing(false);
    };

    liveRecognitionRef.current.onerror = (event) => {
      console.error("Speech error:", event.error);
      setLiveAIResponse("Could not hear you. Tap the mic to try again.");
      setIsLiveAIProcessing(false);
    };

    liveRecognitionRef.current.onend = () => {
      if (isLiveAIProcessing && liveAIResponse === 'Listening...') {
        setLiveAIResponse("I didn't catch that. Tap the mic to try again.");
        setIsLiveAIProcessing(false);
      }
    };

    liveRecognitionRef.current.start();
  };

  const handleNewChat = () => {
    navigate('/dashboard/chat/new');
    setShowHistory(false);
    setMessages([]);
    setInputValue('');
    setAttachments([]);
    setCurrentSessionId('new');
  };

  const groupSessionsByDate = (sessions) => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      'Earlier': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    sessions.forEach(session => {
      const date = new Date(session.lastModified || session.timestamp || Date.now());
      if (date >= today) {
        groups.Today.push(session);
      } else if (date >= yesterday) {
        groups.Yesterday.push(session);
      } else if (date >= lastWeek) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups.Earlier.push(session);
      }
    });

    return groups;
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleSendMessage = async (e, voiceContent = null) => {
    if (e) e.preventDefault();
    console.log("Send Triggered");

    const content = voiceContent !== null ? voiceContent.trim() : inputValue.trim();
    const currentAttachments = attachments;

    console.log("📤 Sending:", { content, attachmentCount: currentAttachments.length, isLoading });

    // Block if no content AND no attachments, or if already loading
    if ((!content && currentAttachments.length === 0) || isLoading) {
      console.log("Send Blocked:", { hasContent: !!content, attachments: currentAttachments.length, isLoading });
      return;
    }

    try {
      setIsLoading(true);
      setInputValue('');
      setAttachments([]);
      console.log("Input Cleared");

      // Reset textarea height manually to 60px
      const ta = document.querySelector('textarea');
      if (ta) ta.style.height = '60px';

      let activeSessionId = currentSessionId;
      let isFirstMessage = false;

      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        isFirstMessage = true;
      }

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        attachment: currentAttachments, // Support array of attachments
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);

      const title = isFirstMessage ? content.slice(0, 30) + '...' : undefined;
      await chatStorageService.saveMessage(activeSessionId, userMsg, title);

      if (isFirstMessage) {
        navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        setCurrentSessionId(activeSessionId);
      }

      // Generate AI response
      // Check if we have multiple document attachments - process separately
      // Case-insensitive extension matching
      const docAttachments = currentAttachments.filter(a => {
        const name = (a.name || '').toLowerCase();
        return a.type === 'file' ||
          name.endsWith('.pdf') ||
          name.endsWith('.docx') ||
          name.endsWith('.doc') ||
          name.endsWith('.txt');
      });
      const imageAttachments = currentAttachments.filter(a => a.type === 'image');

      // Optimized history
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      console.log("🚀 Processing:", {
        docCount: docAttachments.length,
        docNames: docAttachments.map(d => d.name),
        imageCount: imageAttachments.length,
        content: content
      });

      // If multiple documents, process each separately
      if (docAttachments.length > 1) {
        for (let i = 0; i < docAttachments.length; i++) {
          const doc = docAttachments[i];
          console.log(`📄 Processing document ${i + 1}/${docAttachments.length}: ${doc.name}`);

          const docQuestion = content
            ? `Regarding the document "${doc.name}": ${content}`
            : `Please analyze this document: "${doc.name}"`;

          const aiResponseText = await generateChatResponse(chatHistory, docQuestion, "You are AISA, the AI-MALL Intelligence System. If the user says 'hello' or greets you, introduce yourself as AISA.", [doc]);

          const modelMsg = {
            id: (Date.now() + i + 1).toString(),
            role: 'model',
            content: `📄 **${doc.name}**\n\n${aiResponseText}`,
            timestamp: Date.now() + i,
          };

          setMessages((prev) => [...prev, modelMsg]);
          await chatStorageService.saveMessage(activeSessionId, modelMsg);
        }
      } else {
        // Single document or images - process normally
        const aiResponseText = await generateChatResponse(chatHistory, content, "You are AISA, the AI-MALL Intelligence System. If the user says 'hello' or greets you, introduce yourself as AISA.", currentAttachments);
        console.log("✅ AI Response received:", aiResponseText?.slice(0, 100) + "...");

        const modelMsg = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: aiResponseText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, modelMsg]);
        await chatStorageService.saveMessage(activeSessionId, modelMsg);
      }
    } catch (err) {
      console.error("Critical Send Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      await chatStorageService.deleteSession(id);
      const data = await chatStorageService.getSessions();
      setSessions(data);
      if (currentSessionId === id) {
        navigate('/dashboard/chat/new');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full w-full bg-transparent relative overflow-hidden">

      {/* Mobile History Backdrop */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar History - Dreamy Glass Style */}
      <motion.div
        className={`
          flex flex-col flex-shrink-0
          bg-white/40 backdrop-blur-3xl border-r border-white/60 
          absolute inset-y-0 left-0 z-[70] transition-all duration-500 ease-in-out
          md:relative overflow-hidden
          ${showHistory ? 'translate-x-0 w-full md:w-80 shadow-2xl' : '-translate-x-full w-full md:w-0 md:translate-x-0 md:border-none'}
        `}
      >
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-[#8b5cf6]/20 rounded-full blur-2xl animate-blob"></div>
        </div>

        <div className="p-8 w-full md:w-80 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">History<span className="text-[#8b5cf6]">.</span></h2>
            <button
              onClick={() => setShowHistory(false)}
              className="md:hidden p-2 bg-white/50 rounded-full hover:bg-white transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 uppercase text-xs tracking-widest"
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> New Instance
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 no-scrollbar w-full md:w-80">
          {Object.entries(groupSessionsByDate(sessions)).map(([label, groupSessions]) => (
            groupSessions.length > 0 && (
              <div key={label} className="space-y-2">
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2">
                  {label}
                </h3>
                {groupSessions.map((session) => (
                  <div key={session.sessionId} className="group relative">
                    <button
                      onClick={() => {
                        navigate(`/dashboard/chat/${session.sessionId}`);
                        setShowHistory(false);
                      }}
                      className={`w-full text-left px-5 py-4 rounded-[20px] transition-all duration-300 truncate border
                        ${currentSessionId === session.sessionId
                          ? 'bg-white/80 text-[#8b5cf6] border-[#8b5cf6]/20 shadow-sm font-black'
                          : 'text-gray-500 border-transparent hover:bg-white/40 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={14} className={currentSessionId === session.sessionId ? 'text-[#8b5cf6]' : 'text-gray-400'} />
                        <div className="flex-1 truncate">
                          <div className="text-xs font-bold uppercase tracking-tight truncate">
                            {session.title || 'Untitled Session'}
                          </div>
                          <div className="text-[9px] font-black text-gray-400 mt-0.5 tracking-widest">
                            {new Date(session.lastModified || session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(session.lastModified || session.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.sessionId)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-75"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ))}

          {sessions.length === 0 && (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/60">
                <History className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Memory Empty</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Area */}
      <div
        className="flex-1 flex flex-col relative bg-transparent w-full min-w-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-[100] bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500/50 border-dashed m-4 rounded-[32px] flex items-center justify-center pointer-events-none">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-500">
                <Download size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Drop to Attach</h3>
            </div>
          </div>
        )}

        {/* Header - Transparent & Refined */}
        <div className="h-20 flex items-center justify-between px-6 sm:px-10 bg-white/20 backdrop-blur-md border-b border-white/40 z-[50] shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button
              className="p-3 bg-white/40 rounded-xl text-gray-500 hover:text-gray-900 border border-white/60 transition-all shrink-0"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg ring-2 ring-white/50 shrink-0 animate-pulse-glow">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-none flex items-center gap-1.5">
                  AISA <sup className="text-[8px] font-bold text-[#8b5cf6]">TM</sup>
                </h3>
                <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest opacity-80">Online & Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Fluid & Glassy */}
        <div className="flex-1 overflow-y-auto px-2 py-4 sm:p-12 space-y-8 sm:space-y-10 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-[#8b5cf6]/20 blur-[60px] rounded-full animate-blob"></div>
                <div className="relative w-32 h-32 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-full flex items-center justify-center shadow-glass ring-8 ring-white/20">
                  <Sparkles className="w-12 h-12 text-[#8b5cf6] animate-pulse-glow" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Initialize Logic<span className="text-[#8b5cf6]">.</span></h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium max-w-sm leading-relaxed">Your advanced AI agent is calibrated and ready for interaction. How can we optimize your workflow today?</p>
            </div>
          ) : (
            <div className="w-full space-y-8">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`group/msg flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* User Message Actions - Left side, hidden until hover */}


                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white'
                    : 'bg-white text-[#8b5cf6] border border-white/60'
                    }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={22} />}
                  </div>

                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div className={`px-5 py-3 rounded-2xl text-[15px] font-medium leading-normal break-words break-all shadow-sm backdrop-blur-3xl border transition-all hover:shadow-md ${msg.role === 'user'
                      ? 'bg-white/80 text-gray-900 border-white/40 rounded-tr-none'
                      : 'bg-white/40 text-gray-800 border-white/80 rounded-tl-none'
                      }`}>
                      {msg.attachment && Array.isArray(msg.attachment) && msg.attachment.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.attachment.map((at, idx) => (
                            <div key={idx} className="max-w-[150px] rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white/50">
                              {at.type === 'image' ? (
                                <img src={at.content} alt="attachment" className="w-full h-auto object-cover max-h-[150px]" />
                              ) : (
                                <div className="p-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-red-500" />
                                  <span className="text-[11px] font-bold truncate max-w-[100px]">{at.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.attachment && !Array.isArray(msg.attachment) && (
                        <div className="mb-2 max-w-[200px] rounded-xl overflow-hidden border border-gray-200">
                          {msg.attachment.type === 'image' ? (
                            <img src={msg.attachment.content} alt="attachment" className="w-full h-auto" />
                          ) : (
                            <div className="p-3 bg-gray-100 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-red-500" />
                              <span className="text-xs truncate">{msg.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={msg.role === 'model' ? 'markdown-content' : ''}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {msg.role === 'model' && (
                        <div className="flex items-center gap-2 sm:gap-4 mt-6 pt-4 border-t border-black/5">
                          <button
                            onClick={() => handleCopy(msg.content)}
                            className="p-2 -ml-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                            title="Copy"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleAction('like', msg.id)}
                            className={`p-2 transition-all rounded-lg active:scale-95 ${msg.feedback === 'like' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                            title="Helpful"
                          >
                            <ThumbsUp size={16} fill={msg.feedback === 'like' ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => handleAction('dislike', msg.id)}
                            className={`p-2 transition-all rounded-lg active:scale-95 ${msg.feedback === 'dislike' ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                            title="Not Helpful"
                          >
                            <ThumbsDown size={16} fill={msg.feedback === 'dislike' ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => handleAction('share', msg.content, msg.timestamp)}
                            className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all active:scale-95"
                            title="Share"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 px-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • SYNCED
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setInputValue(msg.content);
                          const msgIndex = messages.findIndex(m => m.id === msg.id);
                          if (msgIndex !== -1) {
                            const idsToDelete = [msg.id];
                            if (msgIndex + 1 < messages.length && messages[msgIndex + 1].role === 'model') {
                              idsToDelete.push(messages[msgIndex + 1].id);
                            }
                            setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));
                          }
                          toast.success("Edit your message and resend", { icon: '✏️' });
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all active:scale-95"
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this message and its response?')) {
                            const msgIndex = messages.findIndex(m => m.id === msg.id);
                            if (msgIndex !== -1) {
                              const idsToDelete = [msg.id];
                              if (msgIndex + 1 < messages.length && messages[msgIndex + 1].role === 'model') {
                                idsToDelete.push(messages[msgIndex + 1].id);
                              }
                              setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));
                              toast.success("Messages deleted", { icon: '🗑️' });
                            }
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-white/60 flex items-center justify-center text-[#8b5cf6] shadow-sm animate-pulse">
                    <Sparkles size={18} />
                  </div>
                  <div className="px-6 py-4 rounded-[28px] rounded-tl-none bg-white/20 backdrop-blur-md border border-white/40 flex items-center gap-2">
                    <Loader />
                    <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-[0.2em] ml-2 animate-pulse">Processing Reality</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Floaty Glass Design */}
        <div className="p-2 sm:p-6 md:p-8 lg:p-12 shrink-0 bg-transparent relative z-[60]">
          <div className="w-full max-w-5xl mx-auto flex items-center gap-3">
            <div className="relative">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
              />

              {/* Attach Menu */}
              <AnimatePresence>
                {showAttachMenu && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setShowAttachMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[200px] z-[100]"
                    >
                      <button onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-medium">Document (PDF/Doc)</span>
                      </button>
                      <button onClick={handleCameraClick} className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Camera size={16} />
                        </div>
                        <span className="text-sm font-medium">Camera</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <button
                className={`w-[60px] h-[60px] shrink-0 rounded-full ${showAttachMenu ? 'bg-gray-900 rotate-45' : 'bg-[#3b82f6]'} text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shadow-blue-500/20 z-10 relative`}
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <Plus className="w-6 h-6 transition-transform" />
              </button>
            </div>

            <div className="relative flex-1 group">
              {/* Attachment Previews - High-Performance Layout */}
              {attachments.length > 0 && (
                <div className="absolute bottom-full left-0 mb-3 w-full flex flex-wrap gap-2 max-h-[160px] overflow-y-auto no-scrollbar pb-2">
                  {attachments.map((at, idx) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={idx}
                      className="bg-white/95 backdrop-blur-xl p-1.5 rounded-xl border border-white/60 shadow-md flex items-center gap-2 group relative ring-1 ring-black/5"
                    >
                      {at.type === 'image' ? (
                        <img src={at.content} alt="preview" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                          <FileText size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-5">
                        <p className="text-[10px] sm:text-[11px] font-black text-gray-900 truncate max-w-[80px] sm:max-w-[120px]">{at.name}</p>
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">{at.type}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-red-500 sm:scale-0 sm:group-hover:scale-100"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </motion.div>
                  ))}
                  {attachments.length > 1 && (
                    <button
                      onClick={clearAttachments}
                      className="bg-gray-900/10 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/20 h-fit self-center"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}

              <div className={`relative flex items-center gap-2 bg-white/60 backdrop-blur-3xl border border-white rounded-[32px] p-2 pl-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group focus-within:ring-4 focus-within:ring-[#3b82f6]/10 ${(inputValue.trim() || attachments.length > 0) ? 'min-h-[60px]' : 'h-[60px]'}`}>

                <div className="absolute inset-0 bg-blue-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[32px] pointer-events-none"></div>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Ask Aisa..."
                  className="w-full bg-transparent border-none p-0 py-3 text-left text-[15px] text-gray-900 font-medium placeholder-gray-400 focus:outline-none resize-none overflow-y-auto no-scrollbar max-h-[150px]"
                  style={{ height: (inputValue.trim() || attachments.length > 0) ? 'auto' : '100%' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                  }}
                />

                <div className="flex items-center gap-2 pb-1 pr-2 shrink-0">
                  {!inputValue.trim() && !isListening && (
                    <button
                      type="button"
                      onClick={handleStartLiveAI}
                      className="w-10 h-10 text-[#3b82f6] hover:bg-blue-50 transition-colors rounded-full flex items-center justify-center"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`w-10 h-10 transition-all rounded-full flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 shadow-lg' : 'text-[#3b82f6] hover:bg-blue-50'}`}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
                    className="w-10 h-10 rounded-full bg-[#3b82f6] text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md flex items-center justify-center shadow-blue-500/20 cursor-pointer z-[60]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {
        showCamera && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <div className="relative w-full h-full md:w-3/4 md:h-3/4 bg-black rounded-3xl overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  const stream = videoRef.current.srcObject;
                  stream?.getTracks().forEach(track => track.stop());
                  setShowCamera(false);
                }}
                className="absolute top-6 right-6 p-4 bg-black/50 text-white rounded-full z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 items-center">
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-all"
                >
                  <div className="w-16 h-16 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowFeedbackModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[32px] p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <ThumbsDown size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Feedback</h3>
                </div>
                <button onClick={() => setShowFeedbackModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How can we improve this answer?"
                className="w-full h-32 bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 resize-none"
              />
              <button
                onClick={() => {
                  toast.success("Thanks for the feedback!");
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                }}
                className="w-full mt-6 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all active:scale-95 text-xs tracking-widest uppercase"
              >
                Send Feedback
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[40px] p-8 shadow-2xl relative z-10"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Export & Share</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleExportPDF('open')}
                  className="w-full flex items-center justify-between p-5 bg-white/80 hover:bg-white rounded-[24px] border border-gray-100 transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Monitor size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-tight text-gray-900">Open PDF</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Live Preview</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportPDF('download')}
                  className="w-full flex items-center justify-between p-5 bg-white/80 hover:bg-white rounded-[24px] border border-gray-100 transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Download size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-tight text-gray-900">Download</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Save to Device</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportPDF('share')}
                  className="w-full flex items-center justify-between p-5 bg-white/80 hover:bg-white rounded-[24px] border border-gray-100 transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Share2 size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-tight text-gray-900">Share PDF</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Send Document</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live AI Video Call Overlay */}
      <AnimatePresence>
        {showLiveAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black"
          >
            {/* Video Feed - True Fullscreen */}
            <div className="absolute inset-0">
              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoPaused ? 'opacity-30' : ''}`}
                style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
              />

              {/* Video Paused Indicator */}
              {isVideoPaused && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <Video size={32} className="text-white" />
                  </div>
                </div>
              )}

              {/* Top Controls - Glassmorphism */}
              <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-2xl rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>AISA Live</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Connected</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStopLiveAI}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>


            </div>

            {/* Bottom Controls - Direct on Video */}
            <div className="absolute bottom-4 left-0 right-0 sm:bottom-8 px-4 flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-2 w-full px-4 mb-2">
                {/* AI Response Text - Top most in bottom cluster */}
                {(liveAIResponse || isAiSpeaking) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl mx-auto"
                  >
                    {/* Graphical Voice Visualizer */}
                    {isAiSpeaking && (
                      <div className="flex items-center justify-center gap-1.5 h-16 min-h-[64px] mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 sm:w-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                            animate={{
                              height: [10, 30 + Math.random() * 40, 10],
                            }}
                            transition={{
                              duration: 0.4 + Math.random() * 0.2,
                              repeat: Infinity,
                              repeatType: "mirror",
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {liveAIResponse && (
                      <div style={{ color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)', fontSize: '18px', fontWeight: '700', lineHeight: '1.4' }}>
                        {liveAIResponse}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="flex items-end justify-center gap-4 sm:gap-8 w-full">
                {/* Switch Camera */}
                <div className="flex flex-col items-center gap-2 mb-2 group">
                  <button
                    onClick={handleSwitchCamera}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 active:scale-95 hover:bg-black/60 hover:scale-110 shadow-lg"
                  >
                    <Camera className="w-5 h-5 sm:w-7 sm:h-7" />
                  </button>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-black uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md transition-all group-hover:scale-105">Flip</span>
                </div>

                {/* Pause/Resume Video */}
                <div className="flex flex-col items-center gap-2 mb-2 group">
                  <button
                    onClick={handleToggleVideoPause}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 backdrop-blur-md border border-white/20 hover:scale-110 shadow-lg ${isVideoPaused ? 'bg-green-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                  >
                    {isVideoPaused ? <Video className="w-5 h-5 sm:w-7 sm:h-7" /> : <Video className="w-5 h-5 sm:w-7 sm:h-7" />}
                  </button>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-black uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md transition-all group-hover:scale-105">{isVideoPaused ? 'Resume' : 'Pause'}</span>
                </div>

                {/* Ask Question (Main Button) */}
                <div className="flex flex-col items-center gap-3 group">
                  <button
                    onClick={handleLiveAIQuestion}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-xl border-4 ${isLiveAIProcessing ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-white border-white/50 hover:scale-105 hover:shadow-2xl'}`}
                  >
                    <Mic className={`w-8 h-8 sm:w-10 sm:h-10 ${isLiveAIProcessing ? 'text-white' : 'text-[#8b5cf6]'}`} />
                  </button>
                  <span className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest bg-white/90 px-3 py-1 rounded-full backdrop-blur-md shadow-lg transition-all group-hover:scale-105">
                    {isLiveAIProcessing ? 'Listening...' : 'Ask AISA'}
                  </span>
                </div>

                {/* Type Text Button */}
                <div className="flex flex-col items-center gap-2 mb-2 group">
                  <button
                    onClick={handleStopLiveAI}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 active:scale-95 hover:bg-black/60 hover:scale-110 shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7" />
                  </button>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-black uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md transition-all group-hover:scale-105">Type</span>
                </div>

                {/* End Call */}
                <div className="flex flex-col items-center gap-2 mb-2 group">
                  <button
                    onClick={handleStopLiveAI}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg border border-red-400 hover:scale-110 hover:shadow-red-500/30"
                  >
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-black uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md transition-all group-hover:scale-105">End</span>
                </div>
              </div>

              <div className="flex justify-center w-full mt-2">
                <p style={{
                  color: '#000000',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '800',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  textTransform: 'uppercase'
                }}>
                  {isLiveAIProcessing ? '🎤 Listening...' : '👆 Tap "Ask AISA" & Speak'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
