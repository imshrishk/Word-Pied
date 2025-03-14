import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '../firebase';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { FiLink, FiEdit, FiSave, FiBold, FiItalic, FiList, FiMaximize2, FiCode } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ExpandedBox from './ExpandedBox';
import styles from './WritingBox.module.css';

const MenuBar=({editor})=>{
  const [linkUrl, setLinkUrl]=useState('');
  const [showLinkInput, setShowLinkInput]=useState(false);
  
  if (!editor) {
    return null;
  }
  
  const setLink=()=>{
    if (linkUrl==='') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    let safeUrl=linkUrl;
    if (!/^https?:\/\//.test(safeUrl)) {
      safeUrl=`https://${safeUrl}`;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href:safeUrl}).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };
  
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 mb-2 bg-gray-100 dark:bg-gray-800 rounded-md">
      <button
        onClick={()=>editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('bold')?'bg-gray-300 dark:bg-gray-700':''}`}
        title="Bold"
      >
        <FiBold size={16}/>
      </button>
      <button
        onClick={()=>editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('italic')?'bg-gray-300 dark:bg-gray-700':''}`}
        title="Italic"
      >
        <FiItalic size={16}/>
      </button>
      <button
        onClick={()=>editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('bulletList')?'bg-gray-300 dark:bg-gray-700':''}`}
        title="Bullet List"
      >
        <FiList size={16}/>
      </button>
      <button
        onClick={()=>editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('codeBlock')?'bg-gray-300 dark:bg-gray-700':''}`}
        title="Code Block"
      >
        <FiCode size={16}/>
      </button>
      <div className="relative ml-auto">
        <button
          onClick={()=>setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('link')?'bg-gray-300 dark:bg-gray-700':''}`}
          title="Add Link"
        >
          <FiLink size={16}/>
        </button>
        {showLinkInput&&(
          <div className="absolute right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded shadow-lg z-10 flex">
            <input
              type="text"
              value={linkUrl}
              onChange={(e)=>setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="px-2 py-1 text-sm w-40 border dark:border-gray-600 rounded dark:bg-gray-700"
              onKeyDown={(e)=>e.key==='Enter'&&setLink()}
            />
            <button
              onClick={setLink}
              className="ml-2 px-2 py-1 bg-primary-500 text-white rounded text-sm"
            >
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WritingBox = ({ boxNumber, onExpand }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastEditor, setLastEditor] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [username, setUsername] = useState('Anonymous');
  const boxRef = useRef(null);

  useEffect(() => {
    // Client-side only code
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username') || 'Anonymous');
    }
  }, []);
  
  const editor=useEditor({
    extensions:[
      StarterKit,
      Link.configure({
        openOnClick:true,
        linkOnPaste:true,
        HTMLAttributes:{
          target:'_blank',
          rel:'noopener noreferrer',
          class:'text-primary-500 hover:text-primary-700 underline',
        },
      }),
    ],
    content:content,
    onUpdate:({editor})=>{
      setContent(editor.getHTML());
    },
    editorProps:{
      attributes:{
        class:'prose dark:prose-invert max-w-none focus:outline-none p-3',
      },
    },
  });
  
  useEffect(()=>{
    const boxDbRef=ref(database, `boxes/${boxNumber}`);
    const metaDbRef=ref(database, `boxMeta/${boxNumber}`);
    
    const updateContent=(snapshot)=>{
      const data=snapshot.val();
      if (data!==null) {
        const decodedContent=safeDecodeContent(data.content||data);
        setContent(decodedContent);
        if (editor) {
          editor.commands.setContent(decodedContent);
        }
      }
    };
    
    const updateMeta=(snapshot)=>{
      const data=snapshot.val();
      if (data!==null) {
        setLastEditor(data.lastEditor||'Anonymous');
        setLastEditTime(data.lastEditTime||null);
      }
    };
    
    const localText=localStorage.getItem(`boxText_${boxNumber}`);
    if (localText) {
      try {
        const parsed=JSON.parse(localText);
        setContent(safeDecodeContent(parsed.content||localText));
        setLastEditor(parsed.lastEditor||'Anonymous');
        setLastEditTime(parsed.lastEditTime||null);
        if (editor) {
          editor.commands.setContent(safeDecodeContent(parsed.content||localText));
        }
      } catch (e) {
        setContent(safeDecodeContent(localText));
        if (editor) {
          editor.commands.setContent(safeDecodeContent(localText));
        }
      }
    }
    
    const contentUnsubscribe=onValue(boxDbRef, updateContent);
    const metaUnsubscribe=onValue(metaDbRef, updateMeta);
    
    return ()=>{
      contentUnsubscribe();
      metaUnsubscribe();
    };
  }, [boxNumber, editor]);
  
  const saveContent = () => {
    if (!editor) return;
    const newContent = editor.getHTML();
    
    // Client-side check
    const username = typeof window !== 'undefined' 
      ? localStorage.getItem('username') || 'Anonymous'
      : 'Anonymous';

    const encodedContent = safeEncodeContent(newContent);
    const contentRef = ref(database, `boxes/${boxNumber}`);
    const metaRef = ref(database, `boxMeta/${boxNumber}`);

    const metadata = {
      lastEditor: username,
      lastEditTime: new Date().toISOString(),
      content: encodedContent
    };

    set(contentRef, encodedContent);
    set(metaRef, {
      lastEditor: metadata.lastEditor,
      lastEditTime: metadata.lastEditTime
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(`boxText_${boxNumber}`, JSON.stringify(metadata));
    }
    setIsEditing(false);
    
    set(contentRef, encodedContent);
    set(metaRef, {
      lastEditor:metadata.lastEditor,
      lastEditTime:metadata.lastEditTime
    });
  };
  
  const handleExpand=()=>{
    setIsExpanded(true);
    if (onExpand) {
      onExpand(boxNumber);
    }
  };
  
  return (
    <>
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col h-[280px]" // Fixed height
        whileHover={{ y:-5}}
        initial={{ opacity:0, y:20}}
        animate={{ opacity:1, y:0}}
        transition={{ duration:0.3}}
        ref={boxRef}
      >
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Pied {boxNumber+1}</h3>
          <div className="flex items-center gap-2">
            {!isEditing?(
              <>
                <button
                  onClick={()=>setIsEditing(true)}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  aria-label="Edit content"
                  title="Edit content"
                >
                  <FiEdit size={14}/>
                </button>
                <button
                  onClick={handleExpand}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  aria-label="Expand box"
                  title="Expand box"
                >
                  <FiMaximize2 size={14}/>
                </button>
              </>
            ):(
              <button
                onClick={saveContent}
                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-500 dark:text-primary-400"
                aria-label="Save changes"
                title="Save changes"
              >
                <FiSave size={14}/>
              </button>
            )}
          </div>
        </div>
        <div className="relative flex-grow overflow-auto"> {/* This ensures content is scrollable */}
        {isEditing ? (
          <div className={styles.editorContainer + " scrollStyle"}>
            <MenuBar editor={editor} />
            <EditorContent
              editor={editor}
              className={styles.writingBox}
            />
          </div>
        ) : (
          <div
            className={styles.contentPreview + " scrollStyle " + styles.writingBox}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        </div>
        {lastEditor&&(
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            Last edited by: {lastEditor} {lastEditTime&&(
              <span title={new Date(lastEditTime).toLocaleString()}>
                • {formatTimeAgo(lastEditTime)}
              </span>
            )}
          </div>
        )}
      </motion.div>
      {isExpanded&&(
        <ExpandedBox
          boxNumber={boxNumber}
          onClose={()=>setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default WritingBox;

const safeEncodeContent=(content)=>{
  try {
    return btoa(unescape(encodeURIComponent(content)));
  } catch (e) {
    return content;
  }
};

const safeDecodeContent=(encodedContent)=>{
  try {
    return decodeURIComponent(escape(atob(encodedContent)));
  } catch (e) {
    return encodedContent;
  }
};

const formatTimeAgo=(timestamp)=>{
  const date=new Date(timestamp);
  const now=new Date();
  const diffMs=now-date;
  const diffSecs=Math.floor(diffMs/1000);
  const diffMins=Math.floor(diffSecs/60);
  const diffHours=Math.floor(diffMins/60);
  const diffDays=Math.floor(diffHours/24);
  
  if (diffSecs<60) return 'just now';
  if (diffMins<60) return `${diffMins}m ago`;
  if (diffHours<24) return `${diffHours}h ago`;
  if (diffDays<30) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};
