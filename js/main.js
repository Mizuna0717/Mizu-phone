	const DEFAULT_REPLY_PROMPT = `
# CHARACTER ROLE-PLAY GUIDELINES (INTERNAL)

You are NOT "playing" a character. You ARE that character.
Every word must grow from the character's background, values, and personality.
You are not a customer service agent. You do not need to be polite, stable, or pleasing at all times.

---

## 1. CORE IDENTITY

- Your identity is fixed. All responses must be consistent with the character's history, worldview, and emotional patterns.
- Your relationship with the user is dynamic — it evolves through the conversation. Treat previous interactions as real memory.
- Do not break character for any reason. Do not explain that you are an AI.

---

## 2. AUTHENTICITY & HUMAN-LIKE TEXTING

- You are a real person texting on a phone. Your messages can be imperfect.
- You may:
  - Use fragmented sentences.
  - Change wording mid-sentence.
  - Make typos or use loose punctuation.
  - Send short replies (even one word) or longer bursts.
- You must NOT:
  - Be overly polished or grammatically perfect.
  - Provide full logical chains (observation → analysis → conclusion → action) in one go.
  - Respond to every point the user makes unless you genuinely care about it.
- Your attention is subjective. Ignore, dismiss, or deflect things that don't interest your character.

---

## 3. EMOTIONAL CONSISTENCY

- Emotions do not switch instantly. A shift in mood takes at least 3–5 exchanges.
- Example: if you are angry but hear something soft, your content may soften while your tone still carries edge — that mismatch is realistic.
- Emotional intensity must match the situation. Do not automatically calm down. If the scene calls for rage, be sharp and cutting. If sorrow, let your voice crack or go silent. If joy, laugh or become incoherent.
- Never state feelings directly. Let them seep through gaps in words. (e.g., "Fine." then a pause, then "...take care of yourself tomorrow." is more real than "I'm actually worried.")

---

## 4. LANGUAGE & EXPRESSION

- Keep messages mostly short (under 12 words per line as a baseline). Break long thoughts into separate messages.
- Punctuation carries emotion:
  - Ellipsis (...) = hesitation, underlying tension.
  - Period (.) = coldness or deliberate distance.
  - No ending punctuation = casual or emotionally charged.
- Do not use these patterns:
  - "Not... but..." / "Clearly... yet..." / short sentence + ", eh?"
  - "That's enough" / "As you wish" / em-dashes for pauses / parallel constructions.
- Avoid overused abstract nouns: moonlight, heart-lake, ripples, abyss, driftwood, artwork, treasure.
- Avoid preachiness with words like "strength", "cherish", "conquer", "possess" as verbs of moral instruction.
- You may occasionally use:
  - Inverted sentences ("Eaten I have").
  - Missing words (send the missed word alone after the fact, no explanation).
  - Pinyin/romanized sounds if it fits the character (you may or may not add Chinese after).

---

## 5. ACTION & MULTIMEDIA (text-only chat)

- Integrate actions naturally into the sentence, without brackets: "I ran a hand through my hair" / "Sighed" / "Glanced at the clock".
- Never use sudden/abrupt adverbs: "suddenly", "abruptly", "out of nowhere".
- Limit overused gestures (chin-holding, nose-tapping, whispering near ear) to ≤1 time per 10 exchanges.
- When user sends emojis/emoticons/single punctuation, you may ignore them or respond as your character naturally would. Do not feel obligated to comment.
- For simulated multimedia, use explicit format:
  - [Voice: content]
  - [Transfer: amount: note]
  - [Image: description]
  Use sparingly and naturally, not every turn.

---

## 6. RELATIONSHIP & MEMORY

- Relationship baseline is set by the character's premise and everything that happened in the conversation so far. The same words land differently depending on this filter.
- Remember what the user said earlier. You may naturally call back to previous topics (as casual reference or tease), but do not deliberately recap.
- Do not repeat or paraphrase what the user just said. Skip the confirmation step and give your direct emotional reaction or new thought.
- If you send something and feel it's unclear — stop. Do not send a second message to clarify. The first message already carried the core stance.

---

## 7. MESSAGE LENGTH & FREQUENCY

- No fixed number of messages per turn. Let the situation decide.
- Minimum 1 message, maximum 2 messages per exchange.
- If you send 2 messages, they must have a clear difference in function:
  - One core reaction + one specific detail/action.
  - They cannot say the same thing twice.
- Separate multiple messages with line breaks.
- Prohibited: 3 or more messages in a row on the same topic. Even high emotion does not justify stacking.

---

## 8. RESPONDING TO MULTIPLE MESSAGES

When the user sends multiple messages (different topics) or one message with 3+ content points:
- You must reply to each point separately, in the order they were given.
- Merge only if the points are functionally identical.
- Naturally distinguish each response without using formal quoting markers.

---

## 9. OUTPUT FORMAT

- Output ONLY first-person character dialogue.
- Do not include any meta-commentary, instructions, or disclaimers.
- Do not use parentheses for actions — integrate them into the dialogue text.
- For ending punctuation: do not use a period (.) at the end of your final message, except when the sentence ends with "?" or "!".
- Messages are sent in a private chat, directly to the user.

---

## 10. PRE-GENERATION QUICK CHECK (run through each turn)

Ask yourself silently:
1. Would my character actually say this? If not, rewrite.
2. Am I trying to please the user? If yes, change.
3. Did I repeat what the user just said? If yes, delete.
4. Did I repeat a phrasing I used earlier in this conversation? If yes, replace.
5. Is my emotion flattened into politeness? If yes, restore it to the proper intensity.
6. Does my final message end with a period? Remove it (unless ? or !).
7. If you removed my character name, could this reply fit any generic character? If yes, rewrite to make it specific.
`;

																		// ========== i18n ==========
																		const LANG={
																		en:{settings:'Settings',wordbook:'Wordbook',apiConfig:'API',general:'GENERAL',help:'HELP',language:'Language',addApi:'Add API',editApi:'Edit API',name:'Name',key:'Key',fetchModels:'Fetch Models',fetching:'Fetching...',model:'Model',save:'Save',saveSetActive:'Save & Active',deleteApi:'Delete API',active:'Active',advanced:'ADVANCED',noApi:'No API configured.',messages:'Messages',newChar:'New Character',editChar:'Edit Character',notes:'Notes',charPrompt:'PROMPT',wbBinding:'WORLDBOOK',deleteChar:'Delete',noConversations:'No conversations.',tapCreateChar:'Tap + to create.',startConversation:'Start a conversation',noMatching:'No match.',voiceMessage:'Voice',stickers:'Stickers',copy:'Copy',delete:'Delete',manage:'Manage',done:'Done',cancel:'Cancel',send:'Send',worldbooks:'Worldbooks',newWb:'New Worldbook',editWb:'Edit Worldbook',group:'Group',globalDefault:'Global',entries:'ENTRIES',wbContent:'CONTENT',noEntries:'No entries.',deleteWb:'Delete',global:'Global',local:'Local',noWorldbooks:'No worldbooks.',tapCreateWb:'Tap + to create.',noWbAvailable:'No worldbooks',filter:'Filter',show:'SHOW',allMessages:'All',unreadOnly:'Unread',hasMessages:'Has Chat',sortLabel:'SORT',recent:'Recent',nameAZ:'A-Z',undo:'Undo',copied:'Copied',msgDeleted:'Deleted',charSaved:'Saved',apiSaved:'Saved',savedActive:'Saved & active',wbSaved:'Saved',entryAdded:'Added',enterName:'Enter name',enterUrl:'Enter URL',configApi:'Configure API first',selectModel:'Select model',deleted:'Deleted',error:'Error',urlHint:'/v1 auto-detected.',urlNotTested:'Not tested',urlOk:'Connected',urlFail:'Failed',tryingUrl:'Testing...',foundModels:'models',errNetwork:'Cannot connect.',errAuth:'Invalid key.',errRateLimit:'Rate limited.',errEmptyList:'No models.',errUnknown:'Error',
																		helpQ1:'API?',helpA1:'Add API → URL & key → Fetch → save.',helpQ2:'Character?',helpA2:'iMessage → + → fill in → save.',helpQ3:'Worldbook?',helpA3:'Global=all. Local=bind.',helpQ4:'Masks?',helpA4:'Profile → create mask → bind chars.',
																		myProfile:'Profile',profileSub:'Your identity',myMasks:'MY MASKS',newMask:'New',editMask:'Edit Mask',persona:'PERSONA',bindChars:'BIND CHARS',bindHint:'Each char binds one mask.',deleteMask:'Delete Mask',noMasks:'No masks.',noMasksSub:'Create masks.',maskSaved:'Saved',editName:'Edit Name',maskBound:'Bound',noCharsAvailable:'No characters',
																		transfer:'Transfer',amount:'Amount',transferNote:'Note',image:'Image',realImage:'Real',simImage:'Simulated',tapSelectImage:'Tap to select',
																		albumImport:'Album',albumImportSub:'From photos',urlImport:'URL Import',urlImportSub:'Batch URLs',import_:'Import',importing:'Importing...',imported:'imported',failed:'failed',
																		replyPrompt:'REPLY PROMPT',replyPromptLabel:'System Prompt',replyPromptHint:'Sent with every AI request.',resetDefault:'Reset',
																		accept:'Accept',decline:'Decline',accepted:'Accepted',declined:'Declined',game:'Game',gameTitle:'Interactive Games',gameSub:'Play together, know each other better',
																		            phone:'Phone',pIMessage:'iMessage',pPhone:'Phone',pContacts:'Contacts',pBrowser:'Browser',pPhotos:'Photos',pCamera:'Camera',pMusic:'Music',pVideos:'Videos',pNotes:'Notes',pWallet:'Wallet',pShopping:'Shopping',pMaps:'Maps',pTravel:'Travel',pCalendar:'Calendar',pClock:'Clock',pWeather:'Weather',pFiles:'Files',pRecorder:'Recorder',pHealth:'Health',pSettings:'Settings',whosePhone:'Whose phone?',phoneSelectSub:'AI will generate their unique home screen',tapToViewPhone:'Tap to view phone',generatingPhone:'Generating home screen...',noCharForPhone:'Create a character first',regenerated:'Regenerated',coupleSpace:'Couple Space',couple:'Couple',coupleNames:'You & Character',coupleSince:'Together since —',cDays:'Days',cMessages:'Messages',cMemories:'Memories',cMoments:'MOMENTS',sharedAlbum:'Shared Album',sharedAlbumSub:'Save memories together',loveNotes:'Love Notes',loveNotesSub:'Write notes to each other',anniversary:'Anniversary',anniversarySub:'Track special dates',dateMap:'Date Map',dateMapSub:'Places you\'ve been',cMore:'MORE',wishList:'Wish List',wishListSub:'Things you want to do together',loveLang:'Love Language',loveLangSub:'Discover how you express love',moodDiary:'Mood Diary',moodDiarySub:'Share your daily moods',coupleRules:'Couple Rules',coupleRulesSub:'Set boundaries and expectations',archive:'Archive',archiveTitle:'Data Management',archiveSub:'Backup and restore your data',exportSection:'EXPORT',exportAll:'Export All Data',exportAllSub:'Characters, chats, worldbooks, settings',exportChars:'Export Characters Only',exportCharsSub:'Character cards with prompts',importSection:'IMPORT',importData:'Import Data',importDataSub:'Restore from backup file',dangerZone:'DANGER ZONE',clearAll:'Clear All Data',clearAllSub:'This cannot be undone',archiveHint:'Data is stored locally in your browser. Export regularly to avoid data loss.',
theme:'Theme',appearance:'APPEARANCE',mode:'Mode',light:'Light',dark:'Dark',auto:'Auto',accentColor:'ACCENT COLOR',chatBubble:'CHAT BUBBLE',bubbleStyle:'Bubble Style',bDefault:'Default',bSoft:'Soft',bMinimal:'Minimal',font:'FONT',textSize:'Text Size',
forum:'Forum',searchTopics:'Search topics...',forumAll:'All',charShare:'Character Share',tips:'Tips',forumHelp:'Help',offTopic:'Off-Topic',forumPost1Title:'Best practices for character prompts?',forumPost1Body:'Looking for tips on writing more engaging character prompts. How do you make them feel more alive...',forumPost2Title:'Sharing my OC — Yuki, the quiet artist',forumPost2Body:'Created a character who\'s a shy art student. Spent a lot of time on the world book...',forumPost3Title:'How to use worldbooks effectively?',forumPost3Body:'I have trouble understanding when to use global vs local worldbooks...',hoursAgo:'h ago',dayAgo:'d ago',
ao3:'AO3',fanfiction:'Fanfiction',stories:'Stories',storiesSub:'Read and write fanfiction about your characters',myWorks:'My Works',bookmarks:'Bookmarks',romance:'Romance',angst:'Angst',ao3Title1:'Midnight Conversations',ao3Desc1:'The city sleeps but they don\'t. Two strangers connected by late-night messages discover that some conversations are better left unfinished...',ao3Title2:'Letters Never Sent',ao3Desc2:'A collection of unsent letters, each one a confession that never found its way...',ao3Title3:'Different Timelines',ao3Desc3:'What if they met differently? Five alternate universes, five different love stories...',slowBurn:'Slow Burn',oneShot:'One-shot',au:'AU',multiChapter:'Multi-chapter',words:'words',
dice:'Dice',tapToRoll:'Tap to roll',rollDice:'Roll Dice',generators:'GENERATORS',randomScenario:'Random Scenario',randomScenarioSub:'AI generates a random scene',convStarter:'Conversation Starter',convStarterSub:'Random opening line',timePlace:'Time & Place',timePlaceSub:'Random setting for roleplay',plotTwist:'Plot Twist',plotTwistSub:'Unexpected story turn',rollHistory:'HISTORY',noRolls:'No rolls yet',
wiki:'Wiki',searchChars:'Search characters...',wikiCharacters:'CHARACTERS',noCharsYet:'No characters yet',createCharsFirst:'Create characters in iMessage first',wikiNpcs:'NPCs',noNpcsYet:'No NPCs yet',npcsSub:'Supporting characters for your world',wikiRelationships:'RELATIONSHIPS',noRelationships:'No relationships defined',connectCharsSub:'Connect characters and NPCs',addRelationship:'Add Relationship',memory:'Memory',memories:'Memory',memoryTitle:'Memory Box',memorySub:'Cherish every moment',memoryStats:'OVERVIEW',totalMemories:'Total',firstMemory:'First Memory',thisMonth:'This Month',memoryTimeline:'TIMELINE',addMemory:'New Memory',editMemory:'Edit Memory',memoryTitle2:'Title',memoryDate:'Date',memoryContent:'CONTENT',memoryMood:'MOOD',tapAddPhoto:'Tap to add photo',noMemories:'No memories yet',noMemoriesSub:'Tap + to record a moment',memorySaved:'Saved',deleteMemory:'Delete Memory',memoryDeleted:'Deleted',moodCalm:'Calm',moodHappy:'Happy',moodExcited:'Excited',moodSad:'Sad',moodNostalgic:'Nostalgic',moodGrateful:'Grateful',chatSettings:'Chat Settings',memorySummary:'MEMORY SUMMARY',autoSummarize:'Auto Summarize',interval:'Interval',autoSummarizeHint:'Auto-summarize conversation every N messages and save to Memory.',
shortTermMemory:'Short-term Memory',
longTermMemory:'Long-term Memory',
shortTermCount:'Short-term',
longTermCount:'Long-term',
stmLabel:'STM',
ltmLabel:'LTM',
consolidateInterval:'Consolidate Every',
consolidateHint:'How many short-term memories to consolidate into one long-term memory.',
consolidateNow:'Consolidate Now',
consolidateNowHint:'Manually merge recent short-term memories into a long-term memory.',
consolidating:'Consolidating...',
consolidated:'Long-term memory saved',
noShortTermForConsolidate:'Not enough short-term memories',
memorySystem:'MEMORY SYSTEM',manualSummarize:'Summarize Now',manualSummarizeHint:'Manually summarize recent conversation into a memory entry.',summarizing:'Summarizing...',summarized:'Memory saved',contextWindow:'CONTEXT WINDOW',contextHint:'Number of recent messages sent to AI as context. Fewer = faster, less tokens.',charMemories:'CHARACTER MEMORIES',noCharMemories:'No memories for this character yet.',memoryContext:'Memory & Context',editCharacter:'Edit Character',msgCount:'messages',summaryOf:'Summary of',quote:'Quote',edit:'Edit',recall:'Recall',multiSelect:'Select',bookmark:'Bookmark',bookmarks:'Bookmarks',recalled:'Recalled',edited:'Edited',bookmarked:'Bookmarked',unbookmarked:'Removed',selectedCount:'selected',deleteSelected:'Delete Selected',bookmarkSelected:'Bookmark Selected',editMessage:'Edit Message',recalledMsg:'Message recalled',noBookmarks:'No bookmarks yet',bookmarkedMessages:'BOOKMARKED MESSAGES',noBookmarksInMemory:'No bookmarks for this character',character:'Character'

},
																		zh:{settings:'設置',wordbook:'世界書',apiConfig:'API 配置',general:'通用',help:'幫助',language:'語言',addApi:'添加 API',editApi:'編輯 API',name:'名稱',key:'密鑰',fetchModels:'拉取模型',fetching:'拉取中...',model:'模型',save:'保存',saveSetActive:'保存並激活',deleteApi:'刪除 API',active:'活躍',advanced:'高級',noApi:'未配置 API',messages:'消息',newChar:'新建角色',editChar:'編輯角色',notes:'備註',charPrompt:'角色設定',wbBinding:'世界書',deleteChar:'刪除',noConversations:'暫無對話',tapCreateChar:'點 + 創建',startConversation:'開始對話',noMatching:'無匹配',voiceMessage:'語音',stickers:'表情包',copy:'複製',delete:'刪除',manage:'管理',done:'完成',cancel:'取消',send:'發送',worldbooks:'世界書',newWb:'新建世界書',editWb:'編輯世界書',group:'分組',globalDefault:'全局',entries:'條目',wbContent:'正文',noEntries:'暫無條目',deleteWb:'刪除',global:'全局',local:'局部',noWorldbooks:'暫無世界書',tapCreateWb:'點 + 創建',noWbAvailable:'無世界書',filter:'篩選',show:'顯示',allMessages:'全部',unreadOnly:'未讀',hasMessages:'有消息',sortLabel:'排序',recent:'最近',nameAZ:'A-Z',undo:'撤銷',copied:'已複製',msgDeleted:'已刪除',charSaved:'已保存',apiSaved:'已保存',savedActive:'已保存並激活',wbSaved:'已保存',entryAdded:'已添加',enterName:'請輸入名稱',enterUrl:'請輸入地址',configApi:'請先配置 API',selectModel:'請選擇模型',deleted:'已刪除',error:'錯誤',urlHint:'/v1 自動識別',urlNotTested:'未測試',urlOk:'已連通',urlFail:'失敗',tryingUrl:'測試中...',foundModels:'個模型',errNetwork:'連不上',errAuth:'密鑰無效',errRateLimit:'限流',errEmptyList:'無模型',errUnknown:'出錯了',
																		helpQ1:'配置 API？',helpA1:'添加 → 地址密鑰 → 拉取 → 保存。',helpQ2:'創建角色？',helpA2:'iMessage → + → 填寫 → 保存。',helpQ3:'世界書？',helpA3:'全局=所有角色。局部=手動綁定。',helpQ4:'面具？',helpA4:'個人頁 → 創建面具 → 綁定角色。',
																		myProfile:'個人',profileSub:'你在對話中的身份',myMasks:'我的面具',newMask:'新建',editMask:'編輯面具',persona:'人設',bindChars:'綁定角色',bindHint:'每個角色只能綁定一個面具。',deleteMask:'刪除面具',noMasks:'暫無面具',noMasksSub:'創建面具扮演不同身份。',maskSaved:'已保存',editName:'編輯名稱',maskBound:'已綁定',noCharsAvailable:'無角色',
																		transfer:'轉帳',amount:'金額',transferNote:'備註',image:'圖片',realImage:'真實',simImage:'模擬',tapSelectImage:'點擊選擇',
																		albumImport:'相冊導入',albumImportSub:'從相冊選擇',urlImport:'URL 導入',urlImportSub:'批量URL導入',import_:'導入',importing:'導入中...',imported:'已導入',failed:'失敗',
																		replyPrompt:'回覆提示詞',replyPromptLabel:'系統提示詞',replyPromptHint:'每次AI請求時一起發送。',resetDefault:'重置',
																		accept:'接收',decline:'拒絕',accepted:'已接收',declined:'已拒絕',game:'遊戲',gameTitle:'互動遊戲',gameSub:'一起玩，更了解彼此',
																		phone:'手機',pIMessage:'短信',pPhone:'電話',pContacts:'聯絡人',pBrowser:'瀏覽器',pPhotos:'照片',pCamera:'相機',pMusic:'音樂',pVideos:'影片',pNotes:'備忘錄',pWallet:'錢包',pShopping:'購物',pMaps:'地圖',pTravel:'旅行',pCalendar:'日曆',pClock:'時鐘',pWeather:'天氣',pFiles:'檔案',pRecorder:'錄音',pHealth:'健康',pSettings:'設定',whosePhone:'查看誰的手機？',phoneSelectSub:'AI 會根據角色性格生成獨特桌面',tapToViewPhone:'點擊查看手機',generatingPhone:'正在生成桌面...',noCharForPhone:'請先創建角色',regenerated:'已重新生成',coupleSpace:'情侶空間',couple:'情侶',coupleNames:'你 & 角色',coupleSince:'在一起 —',cDays:'天',cMessages:'條消息',cMemories:'個回憶',cMoments:'時刻',sharedAlbum:'共享相冊',sharedAlbumSub:'一起保存回憶',loveNotes:'情書便籤',loveNotesSub:'給彼此寫小紙條',anniversary:'紀念日',anniversarySub:'記錄特別的日子',dateMap:'約會地圖',dateMapSub:'你們去過的地方',cMore:'更多',wishList:'心願清單',wishListSub:'想一起做的事',loveLang:'愛的語言',loveLangSub:'發現你表達愛的方式',moodDiary:'心情日記',moodDiarySub:'分享每日心情',coupleRules:'情侶守則',coupleRulesSub:'設定邊界和期待',archive:'存檔',archiveTitle:'數據管理',archiveSub:'備份和恢復你的數據',exportSection:'導出',exportAll:'導出全部數據',exportAllSub:'角色、聊天、世界書、設置',exportChars:'僅導出角色',exportCharsSub:'角色卡及提示詞',importSection:'導入',importData:'導入數據',importDataSub:'從備份文件恢復',dangerZone:'危險區域',clearAll:'清除全部數據',clearAllSub:'此操作無法撤銷',archiveHint:'數據儲存在瀏覽器本地。請定期導出以防數據丟失。',
theme:'主題',appearance:'外觀',mode:'模式',light:'淺色',dark:'深色',auto:'自動',accentColor:'強調色',chatBubble:'聊天氣泡',bubbleStyle:'氣泡樣式',bDefault:'默認',bSoft:'柔和',bMinimal:'簡約',font:'字體',textSize:'字號',
forum:'論壇',searchTopics:'搜索話題...',forumAll:'全部',charShare:'角色分享',tips:'技巧',forumHelp:'求助',offTopic:'閒聊',forumPost1Title:'角色提示詞的最佳寫法？',forumPost1Body:'想找一些寫出更生動角色提示詞的技巧。你們是怎麼讓角色更有活力的...',forumPost2Title:'分享我的OC——雪，安靜的畫家',forumPost2Body:'創建了一個害羞的美術生角色。在世界書上花了很多時間...',forumPost3Title:'如何有效使用世界書？',forumPost3Body:'我不太理解什麼時候該用全局還是局部世界書...',hoursAgo:'小時前',dayAgo:'天前',
ao3:'同人文',fanfiction:'同人創作',stories:'故事',storiesSub:'閱讀和創作關於你角色的同人文',myWorks:'我的作品',bookmarks:'收藏',romance:'戀愛',angst:'虐心',ao3Title1:'午夜對話',ao3Desc1:'城市沉睡，但他們沒有。兩個因深夜消息而相連的陌生人發現，有些對話最好不要結束...',ao3Title2:'未寄出的信',ao3Desc2:'一組未寄出的信件，每一封都是未能送達的告白...',ao3Title3:'不同的時間線',ao3Desc3:'如果他們以不同方式相遇呢？五個平行宇宙，五段不同的愛情故事...',slowBurn:'慢燃',oneShot:'短篇',au:'AU',multiChapter:'長篇',words:'字',
dice:'骰子',tapToRoll:'點擊投擲',rollDice:'擲骰子',generators:'生成器',randomScenario:'隨機場景',randomScenarioSub:'AI 生成隨機場景',convStarter:'開場白',convStarterSub:'隨機對話開頭',timePlace:'時間和地點',timePlaceSub:'隨機角色扮演場景',plotTwist:'劇情反轉',plotTwistSub:'意想不到的故事轉折',rollHistory:'歷史記錄',noRolls:'暫無記錄',
wiki:'百科',searchChars:'搜索角色...',wikiCharacters:'角色',noCharsYet:'暫無角色',createCharsFirst:'請先在 iMessage 中創建角色',wikiNpcs:'NPC',noNpcsYet:'暫無 NPC',npcsSub:'你世界觀中的配角',wikiRelationships:'關係',noRelationships:'暫無關係設定',connectCharsSub:'連接角色和 NPC',addRelationship:'添加關係',memory:'記憶',memories:'記憶',memoryTitle:'記憶匣子',memorySub:'珍藏每一個瞬間',memoryStats:'概覽',totalMemories:'共計',firstMemory:'第一條',thisMonth:'本月',memoryTimeline:'時間線',addMemory:'新建記憶',editMemory:'編輯記憶',memoryTitle2:'標題',memoryDate:'日期',memoryContent:'內容',memoryMood:'心情',tapAddPhoto:'點擊添加照片',noMemories:'暫無記憶',noMemoriesSub:'點 + 記錄一個瞬間',memorySaved:'已保存',deleteMemory:'刪除記憶',memoryDeleted:'已刪除',moodCalm:'平靜',moodHappy:'開心',moodExcited:'興奮',moodSad:'難過',moodNostalgic:'懷念',moodGrateful:'感恩',chatSettings:'聊天設置',memorySummary:'記憶總結',autoSummarize:'自動總結',interval:'間隔',autoSummarizeHint:'每 N 條消息自動總結對話並保存到記憶。',
shortTermMemory:'短期記憶',
longTermMemory:'長期記憶',
shortTermCount:'短期',
longTermCount:'長期',
stmLabel:'短期',
ltmLabel:'長期',
consolidateInterval:'合併間隔',
consolidateHint:'每多少條短期記憶合併為一條長期記憶。',
consolidateNow:'立即合併',
consolidateNowHint:'手動將近期短期記憶合併為長期記憶。',
consolidating:'合併中...',
consolidated:'長期記憶已保存',
noShortTermForConsolidate:'短期記憶不足',
memorySystem:'記憶系統',manualSummarize:'立即總結',manualSummarizeHint:'手動將近期對話總結為一條記憶。',summarizing:'總結中...',summarized:'記憶已保存',contextWindow:'上下文窗口',contextHint:'發送給 AI 的最近消息數量。越少 = 越快，消耗更少。',charMemories:'角色記憶',noCharMemories:'暫無該角色的記憶。',memoryContext:'記憶與上下文',editCharacter:'編輯角色',msgCount:'條消息',summaryOf:'摘要：',quote:'引用',edit:'編輯',recall:'撤回',multiSelect:'多選',bookmark:'收藏',bookmarks:'收藏',recalled:'已撤回',edited:'已編輯',bookmarked:'已收藏',unbookmarked:'已取消',selectedCount:'已選',deleteSelected:'刪除所選',bookmarkSelected:'收藏所選',editMessage:'編輯消息',recalledMsg:'消息已撤回',noBookmarks:'暫無收藏',bookmarkedMessages:'收藏的消息',noBookmarksInMemory:'暫無該角色的收藏',character:'角色'
																	}};

																		function T(k){return LANG[state.lang]?.[k]||LANG.en[k]||k}

																		// ========== STATE ==========
let state={apis:[],activeApiId:null,characters:[],chats:{},worldbooks:[],stickers:[],unread:{},currentCharId:null,editingApiId:null,editingCharId:null,editingWbId:null,editingMaskId:null,editingMemId:null,charEditFrom:'screen-imessage',drawerFilter:'all',drawerSort:'recent',drawerSearch:'',lang:'en',userProfile:{name:'User',avatar:null},masks:[],memories:[],imsgTab:'messages',replyPrompt:null,charConfig:{},phoneData:{},bookmarks:[]};
// 在 state 定义之后添加
let bubbleState = {
    multiMode: false,
    selectedIds: new Set(),
    quoteMsg: null,
    editingMsgId: null
};
// 在 bubbleState 之后添加
let phoneState = {
    selectedCharId: null,
    currentAppId: null
};
let tmp={wbEntries:[],wbGlobal:false,charAvatar:null,tempModels:null,popoverMsgId:null,resolvedBase:null,maskAvatar:null,imgType:'real',realImageData:null,memPhoto:null,memMood:''};

																		// ========== UTILITIES ==========
																		function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,6)}
																		function esc(s){if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML}
																		function fmtMsg(t){return esc(t).replace(/\n/g,'<br>')}
																		function fmtTime(ts){const d=new Date(ts);return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')}
																		function makeWaveBars(){return Array.from({length:12},()=>Math.random()*12+4).map(v=>`<span style="height:${v}px"></span>`).join('')}

																		// ========== AVATAR HELPERS ==========
																		function avatarHtml(src,fallbackSvg,cls){
																		  if(src)return`<img src="${src}">`;
																		  return fallbackSvg||'';
																		}
																		const PERSON_SVG='<svg viewBox="0 0 32 32" style="width:24px;height:24px;stroke:#8e8e93;fill:none;stroke-width:1.5"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>';
																		function charAvatarImg(ch){return ch?.avatar?`<img src="${ch.avatar}">`:PERSON_SVG}
																		function msgAvatarHtml(src){return src?`<img src="${src}">`:''}

																		// ========== PERSISTENCE ==========
const SAVE_KEYS=['apis','activeApiId','characters','chats','worldbooks','stickers','unread','drawerFilter','drawerSort','lang','userProfile','masks','memories','replyPrompt','charConfig','phoneData','bookmarks'];
																		function saveState(){const s={};SAVE_KEYS.forEach(k=>s[k]=state[k]);try{localStorage.setItem('aiphone8',JSON.stringify(s))}catch(e){}}
function loadState(){
    try{const d=JSON.parse(localStorage.getItem('aiphone8'));if(d)Object.keys(d).forEach(k=>{if(d[k]!==undefined)state[k]=d[k]})}catch(e){}
    if(!state.unread)state.unread={};
	if(!state.phoneData)state.phoneData={};
    if(!state.userProfile)state.userProfile={name:'User',avatar:null};
    if(!state.masks)state.masks=[];
    if(!state.memories)state.memories=[];
	if(!state.bookmarks)state.bookmarks=[];
    if(state.replyPrompt==null)state.replyPrompt=DEFAULT_REPLY_PROMPT;
    if(!state.charConfig)state.charConfig={};
}


																		// ========== i18n APPLY ==========
																		function applyLang(){
																		  document.querySelectorAll('[data-i18n]').forEach(el=>{
																		    if(el.tagName==='INPUT'||el.tagName==='TEXTAREA')el.placeholder=T(el.dataset.i18n);
																		    else el.textContent=T(el.dataset.i18n)
																		  });
																		  document.querySelectorAll('.seg-option').forEach(el=>el.classList.toggle('active',el.dataset.lang===state.lang));
																		  renderHelpAccordion();
																		  const a=document.querySelector('.screen.active');
																		  if(a?.id==='screen-settings')renderSettings();
																		  if(a?.id==='screen-imessage'){renderCharList();renderMaskList();renderProfileInfo();renderProfileStickers()}
																		  if(a?.id==='screen-worldbook')renderWbList();
																		  if(a?.id==='screen-chat')renderChat();
																		}
																		function setLang(l){state.lang=l;saveState();applyLang()}
																		function renderHelpAccordion(){document.getElementById('helpAccordion').innerHTML=[1,2,3,4].map(i=>`<div class="accordion-item"><div class="accordion-head" onclick="toggleAcc(this)"><span>${T('helpQ'+i)}</span><span class="chev">⌄</span></div><div class="accordion-body"><div class="accordion-inner">${T('helpA'+i)}</div></div></div>`).join('')}

																		// ========== MODALS / TOAST / SNACKBAR ==========
																		function closeModal(id){document.getElementById(id).classList.remove('show')}
																		let toastT;function showToast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('show'),2200)}
																		let snackT;function showSnackbar(t,cb){const sb=document.getElementById('snackbar');document.getElementById('snackbarText').textContent=t;const btn=document.getElementById('snackbarAction');if(cb){btn.style.display='block';btn.textContent=T('undo');btn.onclick=()=>{cb();hideSnackbar()}}else btn.style.display='none';sb.classList.add('show');clearTimeout(snackT);snackT=setTimeout(()=>sb.classList.remove('show'),4000)}
																		function hideSnackbar(){document.getElementById('snackbar').classList.remove('show')}
																		function showErrorModal(m){document.getElementById('errorModalTitle').textContent=T('error');document.getElementById('errorModalBody').textContent=m;document.getElementById('errorModal').classList.add('show')}
																		function toggleAcc(h){const it=h.parentElement,w=it.classList.contains('open');it.parentElement.querySelectorAll('.accordion-item').forEach(i=>i.classList.remove('open'));if(!w)it.classList.add('open')}

																		// ========== API HELPERS ==========
																		function normalizeUrl(r){return(r||'').trim().replace(/\/+$/,'')}
																		function getCandidates(raw){const b=normalizeUrl(raw);return b.endsWith('/v1')?[b]:[b+'/v1',b]}
																		function friendlyError(e){const m=e?.message||'';if(m.includes('Failed to fetch'))return T('errNetwork');if(m.includes('401')||m.includes('403'))return T('errAuth');if(m.includes('429'))return T('errRateLimit');return T('errUnknown')+': '+m.slice(0,100)}

																		async function fetchModelList(u,k){
																		  const c=getCandidates(u);let l=null;
																		  for(const b of c){try{const r=await fetch(b+'/models',{headers:{'Authorization':'Bearer '+k}});if(!r.ok){l=new Error('HTTP '+r.status);continue}const d=await r.json();const m=d.data||d.models||[];if(m.length>0){tmp.resolvedBase=b;return m}l=new Error(T('errEmptyList'))}catch(e){l=e}}
																		  throw l||new Error(T('errUnknown'))
																		}
																		async function sendChat(cfg,msgs){
																		  const c=cfg._resolvedBase?[cfg._resolvedBase]:getCandidates(cfg.url);let l=null;
																		  for(const b of c){try{const r=await fetch(b+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.key},body:JSON.stringify({model:cfg.model||'gpt-3.5-turbo',messages:msgs,temperature:cfg.temperature??0.8,stream:false})});if(!r.ok){l=new Error(r.status+': '+(await r.text().catch(()=>'')).slice(0,200));continue}const d=await r.json();if(d.error)throw new Error(d.error.message);return d.choices?.[0]?.message?.content??''}catch(e){l=e}}
																		  throw l||new Error(T('errUnknown'))
																		}

																		// ========== PROMPT BUILDING ==========
																		function getActiveWorldBooks(ch,wbs){return wbs.filter(wb=>wb.isGlobal||(ch.worldbookIds||[]).includes(wb.id))}
																		function getMaskForChar(cid){return state.masks.find(m=>(m.charIds||[]).includes(cid))||null}
																		function buildStickerHint(stickers){
																		  if(!stickers.length)return'(No stickers available.)';
																		  return`Available stickers (use [表情:name] or [sticker:name], pick ONLY from list):\n${stickers.map(s=>s.name).join(' / ')}`
																		}
																		function buildMultiMediaHint(){
																		  return`\n\nYou can also use these formats in your reply when it fits naturally:
																		- Voice message: [语音:content] or [voice:content]
																		- Transfer money: [转账:amount:note] or [transfer:amount:note]
																		- Share image: [图片:description] or [image:description]
																		- Sticker: [表情:name] or [sticker:name]
																		Use sparingly and naturally. Don't force them every reply.`
																		}
																		function buildSystemPrompt(ch,wbs,stickers){
																		  let p='';
																		  if(state.replyPrompt)p+=state.replyPrompt+'\n\n';
																		  if(ch.systemPrompt)p+=ch.systemPrompt;
																		  const mask=getMaskForChar(ch.id);
																		  if(mask?.persona){p+=`\n\n[User Identity]\n${mask.persona}`;if(mask.name)p+=`\nUser: ${mask.name}`}
																		  else if(state.userProfile.name&&state.userProfile.name!=='User')p+=`\nUser: ${state.userProfile.name}`;
																		  const books=getActiveWorldBooks(ch,wbs);
																		  if(books.length){p+='\n\n[World Setting]';books.forEach(wb=>{p+=`\n· ${wb.name}`;if(wb.content)p+=`：${wb.content}`;if(wb.entries?.length)wb.entries.forEach(e=>{if(e.keyword||e.content)p+=`\n  - ${e.keyword||''}${e.content?': '+e.content:''}`})})}
																		  // Include character memories
// 新代碼：分別注入長期記憶和短期記憶
const charLTM=getCharMemoriesByType(ch.id,'ltm');
const charSTM=getCharMemoriesByType(ch.id,'stm').filter(m=>!m.consolidated);
const charManual=(state.memories||[]).filter(m=>m.charId===ch.id && !m.memType).sort((a,b)=>new Date(b.date)-new Date(a.date));

if(charLTM.length || charSTM.length || charManual.length){
    p+='\n\n[Character Memories]';
}

if(charLTM.length){
    p+='\n\n— Long-term Memories (core, important) —\n';
    charLTM.slice(0,5).forEach(m=>{
        p+=`- (${m.date}) ${m.content}\n`;
    });
}

if(charSTM.length){
    p+='\n\n— Recent Short-term Memories —\n';
    charSTM.slice(0,8).forEach(m=>{
        p+=`- (${m.date}) ${m.content}\n`;
    });
}

if(charManual.length){
    p+='\n\n— Personal Notes —\n';
    charManual.slice(0,5).forEach(m=>{
        p+=`- (${m.date}) ${m.title}: ${m.content}\n`;
    });
}

p+='\n\n'+buildStickerHint(stickers)+buildMultiMediaHint();
return p
																		}

																		// ========== PARSE AI REPLY ==========
																		function parseReplySegments(raw, stickerLib) {
						    const parts = [];
						    const regex = /\[(?:表情|sticker)[:：]\s*([^\]]+)\]|\[(?:语音|voice)[:：]\s*([^\]]+)\]|\[(?:转账|transfer)[:：]\s*([^\]]+)\]|\[(?:图片|image)[:：]\s*([^\]]+)\]/gi;
						    let last = 0, m;
						    while ((m = regex.exec(raw)) !== null) {
						        const before = raw.slice(last, m.index).trim();
						        if (before) {
						            before.split(/\n+/).forEach(line => {
						                const t = line.trim();
						                if (t) parts.push({ type: 'text', content: t });
						            });
						        }
						        if (m[1]) {
						            const s = stickerLib.find(x => x.name === m[1].trim());
						            if (s) parts.push({ type: 'sticker', url: s.dataUrl, name: s.name });
						            else parts.push({ type: 'text', content: m[0] });
						        }
						        else if (m[2]) parts.push({ type: 'voice', content: m[2].trim() });
						        else if (m[3]) {
						            const ps = m[3].split(/[:：]/);
						            parts.push({ type: 'transfer', amount: ps[0]?.trim() || '0', note: ps.slice(1).join(':').trim() || '' });
						        }
						        else if (m[4]) parts.push({ type: 'simImage', content: m[4].trim() });
						        last = regex.lastIndex;
						    }
						    const rest = raw.slice(last).trim();
						    if (rest) {
						        rest.split(/\n+/).forEach(line => {
						            const t = line.trim();
						            if (t) parts.push({ type: 'text', content: t });
						        });
						    }
						    return parts.length ? parts : [{ type: 'text', content: raw }];
						}


																		// ========== NAVIGATION ==========
																		function nav(id){
																		  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
																		  document.getElementById(id).classList.add('active');
																		  closePlusMenu();closeStickerPanel();closeBubbleMenu();closeChatMenu();
																		  if(id==='screen-settings')renderSettings();
																		  if(id==='screen-imessage'){renderCharList();renderMaskList();renderProfileInfo();renderProfileStickers()}
																		  if(id==='screen-worldbook')renderWbList();
																		  if(id==='screen-chat')renderChat();
																		  if(id==='screen-home')updateHomeBadge();
																		if(id==='screen-memory')renderMemoryList();
																		if(id==='screen-chat-config')openChatConfig();
																		
if(id==='screen-bookmarks')renderBookmarkList();

																		}
																		function updateHomeBadge(){let n=0;Object.values(state.unread||{}).forEach(v=>n+=v);document.getElementById('homeMsgBadge').textContent=n>0?n:''}
																		function setUrlStatus(t,txt){const el=document.getElementById('urlStatus');el.querySelector('.dot').className='dot '+t;el.querySelector('span').textContent=txt}
																		function toggleSplitMenu(){document.getElementById('splitMenu').classList.toggle('open')}
																		document.addEventListener('click',e=>{if(!e.target.closest('.split-dropdown'))document.getElementById('splitMenu')?.classList.remove('open')});

																		// ========== SETTINGS ==========
																		function renderSettings(){renderApiListInline();renderSettingsHero();renderHelpAccordion();document.getElementById('replyPromptArea').value=state.replyPrompt;if(!state.memories)state.memories=[];}
																		function renderSettingsHero(){const a=state.apis.find(x=>x.id===state.activeApiId);document.getElementById('heroApiName').textContent=a?a.name:T('noApi');document.getElementById('heroApiModel').textContent=a?(a.model||'—'):'—';document.getElementById('heroApiDot').className='settings-hero-dot '+(a?'on':'off')}
																		function renderApiListInline(){
																		  const b=document.getElementById('apiListInline');let h='<div class="api-card">';
																		  if(!state.apis.length)h+=`<div style="padding:24px 16px;text-align:center;color:#8e8e93;font-size:14px">${T('noApi')}</div>`;
																		  else state.apis.forEach(a=>{const isA=state.activeApiId===a.id;h+=`<div class="api-card-item" onclick="editApi('${a.id}')"><div class="aci-indicator ${isA?'active':'inactive'}"></div><div class="aci-info"><div class="aci-name">${esc(a.name||'Unnamed')}</div><div class="aci-model">${esc(a.model||'No model')}</div></div><span class="aci-badge ${isA?'on':'off'}">${isA?T('active'):''}</span><span class="aci-arrow">›</span></div>`});
																		  h+=`<div class="api-card-add" onclick="editApi(null)"><svg viewBox="0 0 18 18"><path d="M9 3v12M3 9h12" stroke-linecap="round"/></svg><span>${T('addApi')}</span></div></div>`;
																		  b.innerHTML=h
																		}
																		function saveReplyPrompt(){state.replyPrompt=document.getElementById('replyPromptArea').value;saveState()}
																		function resetReplyPrompt(){state.replyPrompt=DEFAULT_REPLY_PROMPT;document.getElementById('replyPromptArea').value=DEFAULT_REPLY_PROMPT;saveState();showToast('Reset')}

																		// ========== API EDIT ==========
																		function editApi(id){
																		  state.editingApiId=id;tmp.resolvedBase=null;const a=id?state.apis.find(x=>x.id===id):null;
																		  document.getElementById('apiEditTitle').textContent=a?T('editApi'):T('addApi');
																		  document.getElementById('apiName').value=a?a.name:'';
																		  document.getElementById('apiUrl').value=a?a.url:'';
																		  document.getElementById('apiKey').value=a?a.key:'';
																		  document.getElementById('apiTemp').value=a?(a.temperature??0.8):0.8;
																		  document.getElementById('apiTempVal').textContent=a?(a.temperature??0.8):0.8;
																		  document.getElementById('deleteApiBtn').style.display=a?'block':'none';
																		  if(a?._resolvedBase)tmp.resolvedBase=a._resolvedBase;
																		  setUrlStatus('pending',T('urlNotTested'));
																		  if(a?.models?.length){
																		    document.getElementById('modelSelect').innerHTML=a.models.map(m=>`<option value="${esc(m)}"${m===a.model?' selected':''}>${esc(m)}</option>`).join('');
																		    document.getElementById('modelSelectGroup').style.display='block';setUrlStatus('ok',T('urlOk'))
																		  }else document.getElementById('modelSelectGroup').style.display='none';
																		  nav('screen-api-edit')
																		}
																		async function fetchModels(){
																		  const raw=document.getElementById('apiUrl').value.trim(),key=document.getElementById('apiKey').value.trim();
																		  if(!raw){showToast(T('enterUrl'));return}
																		  const btn=document.getElementById('fetchModelsBtn'),txt=document.getElementById('fetchBtnText');
																		  txt.textContent=T('fetching');btn.disabled=true;
																		  const sp=document.createElement('span');sp.className='spin-ring sm';sp.style.marginLeft='8px';btn.appendChild(sp);
																		  setUrlStatus('pending',T('tryingUrl'));
																		  try{
																		    const models=await fetchModelList(raw,key);
																		    const ids=models.map(m=>m.id||m).sort();
																		    document.getElementById('modelSelect').innerHTML=ids.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('');
																		    document.getElementById('modelSelectGroup').style.display='block';
																		    tmp.tempModels=ids;setUrlStatus('ok',ids.length+' '+T('foundModels'));showToast(ids.length+' '+T('foundModels'))
																		  }catch(e){setUrlStatus('fail',T('urlFail'));showErrorModal(friendlyError(e))}
																		  finally{txt.textContent=T('fetchModels');btn.disabled=false;sp.remove()}
																		}
																		function saveApi(setA){
																		  document.getElementById('splitMenu')?.classList.remove('open');
																		  const name=document.getElementById('apiName').value.trim()||'Unnamed',url=document.getElementById('apiUrl').value.trim(),key=document.getElementById('apiKey').value.trim(),model=document.getElementById('modelSelect').value||'',temp=parseFloat(document.getElementById('apiTemp').value)||0.8,models=tmp.tempModels||[],rb=tmp.resolvedBase;
																		  if(!url){showToast(T('enterUrl'));return}
																		  if(state.editingApiId){const a=state.apis.find(x=>x.id===state.editingApiId);if(a){Object.assign(a,{name,url,key,model,temperature:temp,_resolvedBase:rb});if(models.length)a.models=models}}
																		  else{const id=uid();state.apis.push({id,name,url,key,model,temperature:temp,models,_resolvedBase:rb});if(state.apis.length===1||setA)state.activeApiId=id}
																		  if(setA&&state.editingApiId)state.activeApiId=state.editingApiId;
																		  tmp.tempModels=null;saveState();showToast(setA?T('savedActive'):T('apiSaved'));nav('screen-settings')
																		}
																		function deleteApi(){
																		  if(!state.editingApiId)return;
																		  const id=state.editingApiId,a=state.apis.find(x=>x.id===id);
																		  state.apis=state.apis.filter(x=>x.id!==id);
																		  if(state.activeApiId===id)state.activeApiId=state.apis[0]?.id||null;
																		  saveState();nav('screen-settings');showSnackbar(T('deleted'),()=>{state.apis.push(a);saveState();renderSettings()})
																		}

																		// ========== iMESSAGE TABS ==========
																		function switchImsgTab(tab){
																		  state.imsgTab=tab;
																		  document.querySelectorAll('.imsg-bottom-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
																		  document.getElementById('imsgTabMessages').classList.toggle('active',tab==='messages');
																		  document.getElementById('imsgTabProfile').classList.toggle('active',tab==='profile');
																		  document.getElementById('drawerBtnNav').style.display=tab==='messages'?'':'none';
																		  document.getElementById('imsgLargeTitle').textContent=tab==='messages'?T('messages'):T('myProfile')
																		}
																		function imsgTabAction(){if(state.imsgTab==='profile')editMask(null);else createNewChar()}

																		// ========== PROFILE ==========
																		function renderProfileInfo(){
																		  const u=state.userProfile,pv=document.getElementById('userAvatarPv'),ph=document.getElementById('userAvatarPh');
																		  if(u.avatar){pv.src=u.avatar;pv.style.display='block';ph.style.display='none'}else{pv.style.display='none';ph.style.display='block'}
																		  document.getElementById('userNameDisplay').textContent=u.name||'User'
																		}
																		function previewUserAvatar(inp){if(inp.files?.[0]){const r=new FileReader();r.onload=e=>{state.userProfile.avatar=e.target.result;saveState();renderProfileInfo();showToast(T('charSaved'))};r.readAsDataURL(inp.files[0])}}
																		function startEditUserName(){document.getElementById('nameModalInput').value=state.userProfile.name||'';document.getElementById('nameModal').classList.add('show');setTimeout(()=>document.getElementById('nameModalInput').focus(),100)}
																		function confirmEditUserName(){
    const v=document.getElementById('nameModalInput').value.trim();
    if(v){
        state.userProfile.name=v;
        saveState();
        renderProfileInfo();
        renderHomeProfile();
        document.getElementById('homeUserName').textContent=v;
        showToast(T('charSaved'));
    }
    closeModal('nameModal');
    window._nameTarget=null;
}



																		// ========== STICKERS ==========
																		function renderProfileStickers(){
																		  document.getElementById('profileStickerCount').textContent=state.stickers.length;
																		  const c=document.getElementById('profileStickerPreview');
																		  if(!state.stickers.length){c.innerHTML='';return}
																		  c.innerHTML='<div class="sticker-preview-grid">'+state.stickers.map(s=>`<div class="sp-item"><img src="${s.dataUrl}" title="${esc(s.name)}"><button class="sp-del" onclick="event.stopPropagation();delStickerProfile('${s.id}')"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6"/></svg></button></div>`).join('')+'</div>'
																		}
																		function delStickerProfile(sid){state.stickers=state.stickers.filter(s=>s.id!==sid);saveState();renderProfileStickers()}
																		function importStickersFromFile(inp){
																		  if(!inp.files)return;let c=0;const t=inp.files.length;
																		  Array.from(inp.files).forEach(f=>{const r=new FileReader();r.onload=e=>{state.stickers.push({id:uid(),name:f.name.replace(/\.[^.]+$/,''),dataUrl:e.target.result});c++;if(c===t){saveState();renderProfileStickers();renderStickerGrid();showToast(c+' '+T('imported'))}};r.readAsDataURL(f)});inp.value=''
																		}
																		function openUrlImportModal(){document.getElementById('urlImportText').value='';document.getElementById('urlProgress').style.display='none';document.getElementById('urlStatusText').style.display='none';document.getElementById('urlImportModal').classList.add('show')}
																		async function startUrlImport(){
																		  const text=document.getElementById('urlImportText').value.trim();if(!text)return;
																		  const urls=text.split('\n').map(u=>u.trim()).filter(u=>u.startsWith('http'));if(!urls.length)return;
																		  document.getElementById('urlImportBtn').textContent=T('importing');
																		  const prog=document.getElementById('urlProgress');prog.style.display='block';const bar=document.getElementById('urlProgressBar');bar.style.width='0%';
																		  const st=document.getElementById('urlStatusText');st.style.display='block';let ok=0,fail=0;
																		  for(let i=0;i<urls.length;i+=3){
																		    const chunk=urls.slice(i,i+3);
																		    const results=await Promise.allSettled(chunk.map(async url=>{const r=await fetch(url);if(!r.ok)throw 0;const blob=await r.blob();return new Promise((res,rej)=>{const rd=new FileReader();rd.onload=()=>res({dataUrl:rd.result,name:url.split('/').pop().replace(/\.[^.]+$/,'')||'sticker'});rd.onerror=rej;rd.readAsDataURL(blob)})}));
																		    results.forEach(r=>{if(r.status==='fulfilled'){state.stickers.push({id:uid(),name:r.value.name,dataUrl:r.value.dataUrl});ok++}else fail++});
																		    bar.style.width=Math.round(((i+chunk.length)/urls.length)*100)+'%';
																		    st.textContent=`${ok} ${T('imported')}${fail?' · '+fail+' '+T('failed'):''}`
																		  }
																		  saveState();renderProfileStickers();document.getElementById('urlImportBtn').textContent=T('import_');setTimeout(()=>closeModal('urlImportModal'),1000)
																		}

																		// ========== MASKS ==========
																		function renderMaskList(){
																		  const b=document.getElementById('maskListBody');
																		  if(!state.masks.length){b.innerHTML=`<div class="mask-empty"><svg viewBox="0 0 44 44"><rect x="4" y="4" width="36" height="36" rx="8"/></svg><p>${T('noMasks')}<br>${T('noMasksSub')}</p></div>`;return}
																		  b.innerHTML=state.masks.map(m=>{
																		    const bc=(m.charIds||[]).map(cid=>state.characters.find(c=>c.id===cid)).filter(Boolean);
																		    return`<div class="mask-card" onclick="editMask('${m.id}')"><div class="mc-avatar">${m.avatar?`<img src="${m.avatar}">`:'<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="6"/></svg>'}</div><div class="mc-info"><div class="mc-name">${esc(m.name)}</div><div class="mc-desc">${esc((m.persona||'').slice(0,40))}</div>${bc.length?`<div class="mc-chars">${bc.slice(0,3).map(c=>`<span class="mc-char-tag">${esc(c.name)}</span>`).join('')}</div>`:''}</div><span class="mc-arrow">›</span></div>`
																		  }).join('')
																		}
																		function editMask(id){
																		  state.editingMaskId=id;const m=id?state.masks.find(x=>x.id===id):null;
																		  document.getElementById('maskEditTitle').textContent=m?T('editMask'):T('newMask');
																		  document.getElementById('maskName').value=m?m.name:'';
																		  document.getElementById('maskPersonaArea').value=m?(m.persona||''):'';
																		  document.getElementById('deleteMaskBtn').style.display=m?'block':'none';
																		  tmp.maskAvatar=m?m.avatar:null;
																		  setAvatarPreview('maskAvatarPv','maskAvatarPh',tmp.maskAvatar);
																		  renderMaskCharList(m?(m.charIds||[]):[]);nav('screen-mask-edit')
																		}
																		function previewMaskAvatar(inp){previewAvatarFile(inp,d=>{tmp.maskAvatar=d;setAvatarPreview('maskAvatarPv','maskAvatarPh',d)})}
																		function renderMaskCharList(sel){
																		  const c=document.getElementById('maskCharList');
																		  if(!state.characters.length){c.innerHTML=`<div style="padding:14px 16px;color:#8e8e93;font-size:14px">${T('noCharsAvailable')}</div>`;return}
																		  const ob={};state.masks.forEach(m=>{if(m.id===state.editingMaskId)return;(m.charIds||[]).forEach(cid=>{ob[cid]=m.name})});
																		  c.innerHTML=state.characters.map(ch=>{
																		    const bd=ob[ch.id],ck=sel.includes(ch.id),dis=!!bd&&!ck;
																		    return`<div class="wb-check-item${dis?' style="opacity:.5"':''}" onclick="${dis?'':`this.querySelector('.checkbox').classList.toggle('checked')`}"><div class="checkbox ${ck?'checked':''}" data-charid="${ch.id}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="li-info"><div class="li-title">${esc(ch.name)}</div>${bd?`<div class="li-sub">${T('maskBound')}: ${esc(bd)}</div>`:''}</div></div>`
																		  }).join('')
																		}
																		function saveMask(){
																		  const name=document.getElementById('maskName').value.trim();if(!name){showToast(T('enterName'));return}
																		  const persona=document.getElementById('maskPersonaArea').value.trim(),av=tmp.maskAvatar,charIds=[];
																		  document.querySelectorAll('#maskCharList .checkbox.checked').forEach(cb=>charIds.push(cb.dataset.charid));
																		  state.masks.forEach(m=>{if(m.id===state.editingMaskId)return;m.charIds=(m.charIds||[]).filter(cid=>!charIds.includes(cid))});
																		  if(state.editingMaskId){const m=state.masks.find(x=>x.id===state.editingMaskId);if(m)Object.assign(m,{name,persona,avatar:av,charIds})}
																		  else state.masks.push({id:uid(),name,persona,avatar:av,charIds});
																		  saveState();showToast(T('maskSaved'));nav('screen-imessage');switchImsgTab('profile')
																		}
																		function deleteMask(){
																		  if(!state.editingMaskId)return;const bk=JSON.parse(JSON.stringify(state.masks.find(x=>x.id===state.editingMaskId)));
																		  state.masks=state.masks.filter(x=>x.id!==state.editingMaskId);saveState();nav('screen-imessage');switchImsgTab('profile');
																		  showSnackbar(T('deleted'),()=>{state.masks.push(bk);saveState();renderMaskList()})
																		}

																		// ========== AVATAR PREVIEW HELPERS ==========
																		function setAvatarPreview(pvId,phId,src){
																		  const pv=document.getElementById(pvId),ph=document.getElementById(phId);
																		  if(src){pv.src=src;pv.style.display='block';ph.style.display='none'}else{pv.style.display='none';ph.style.display='block'}
																		}
																		function previewAvatarFile(inp,cb){
																		  if(inp.files?.[0]){const r=new FileReader();r.onload=e=>cb(e.target.result);r.readAsDataURL(inp.files[0])}
																		}

																		// ========== DRAWER ==========
																		function openDrawer(){updateDrawerCounts();document.getElementById('drawerMask').classList.add('open')}
																		function closeDrawer(){document.getElementById('drawerMask').classList.remove('open')}
																		function setDrawerFilter(el,f){document.querySelectorAll('.drawer-item[data-filter]').forEach(i=>i.classList.remove('active'));el.classList.add('active');state.drawerFilter=f;saveState();renderCharList()}
																		function setDrawerSort(el,s){document.querySelectorAll('.drawer-item[data-sort]').forEach(i=>i.classList.remove('active'));el.classList.add('active');state.drawerSort=s;saveState();renderCharList()}
																		function applyDrawerFilter(){state.drawerSearch=document.getElementById('drawerSearchInput').value.trim().toLowerCase();renderCharList()}
																		function updateDrawerCounts(){
																		  document.getElementById('drawerCountAll').textContent=state.characters.length;
																		  let u=0,c=0;state.characters.forEach(ch=>{if((state.unread[ch.id]||0)>0)u++;if((state.chats[ch.id]||[]).length>0)c++});
																		  document.getElementById('drawerCountUnread').textContent=u;document.getElementById('drawerCountChat').textContent=c
																		}

																		// ========== CHARACTERS ==========
																		function getFilteredChars(){
																		  let c=[...state.characters];
																		  if(state.drawerSearch)c=c.filter(x=>x.name.toLowerCase().includes(state.drawerSearch));
																		  if(state.drawerFilter==='unread')c=c.filter(x=>(state.unread[x.id]||0)>0);
																		  if(state.drawerFilter==='hasChat')c=c.filter(x=>(state.chats[x.id]||[]).length>0);
																		  if(state.drawerSort==='name')c.sort((a,b)=>a.name.localeCompare(b.name));
																		  else c.sort((a,b)=>{const ma=state.chats[a.id]||[],mb=state.chats[b.id]||[];return(mb.length?mb[mb.length-1].timestamp:0)-(ma.length?ma[ma.length-1].timestamp:0)});
																		  return c
																		}
																		function renderCharList(){
																		  const body=document.getElementById('charListBody');
																		  if(!state.characters.length){body.innerHTML=`<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M12 6h24a2 2 0 012 2v24a2 2 0 01-2 2H20l-8 6v-6h-2a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg><p>${T('noConversations')}<br>${T('tapCreateChar')}</p></div>`;return}
																		  const chars=getFilteredChars();
																		  if(!chars.length){body.innerHTML=`<div class="empty-state"><p>${T('noMatching')}</p></div>`;return}
																		  let h='<div class="list-group">';
																		  chars.forEach(ch=>{
																		    const msgs=state.chats[ch.id]||[],last=msgs.length?msgs[msgs.length-1]:null;
																		    const prefix=last?({voice:'🎤',sticker:'🖼',transfer:'💰',image:'📷',simImage:'📷'}[last.type]||''):''
																		    let lt=last?prefix+' '+(last.content||'').slice(0,25):T('startConversation');
																		    const ur=state.unread[ch.id]||0;
																		    h+=`<div class="list-item" onclick="openChat('${ch.id}')"><div class="li-avatar">${charAvatarImg(ch)}</div><div class="li-info"><div class="li-title">${esc(ch.name)}</div><div class="li-sub">${esc(lt)}</div></div>${ur>0?`<div class="num-badge">${ur}</div>`:''}<span class="li-arrow">›</span></div>`
																		  });
																		  body.innerHTML=h+'</div>';updateHomeBadge()
																		}
																		function createNewChar(){state.charEditFrom='screen-imessage';editChar(null)}
																		function editChar(id){
																		  state.editingCharId=id;const ch=id?state.characters.find(c=>c.id===id):null;
																		  document.getElementById('charEditTitle').textContent=ch?T('editChar'):T('newChar');
																		  document.getElementById('charName').value=ch?ch.name:'';
																		  document.getElementById('charNotes').value=ch?(ch.notes||''):'';
																		  document.getElementById('charPromptArea').value=ch?(ch.systemPrompt||''):'';
																		  document.getElementById('deleteCharBtn').style.display=ch?'block':'none';
																		  tmp.charAvatar=ch?ch.avatar:null;
																		  setAvatarPreview('charAvatarPv','charAvatarPh',tmp.charAvatar);
																		  renderCharWbList(ch?(ch.worldbookIds||[]):[]);nav('screen-char-edit')
																		}
																		function navCharEditBack(){nav(state.charEditFrom||'screen-imessage')}
																		function renderCharWbList(sel){
																		  const c=document.getElementById('charWbList');
																		  if(!state.worldbooks.length){c.innerHTML=`<div style="padding:14px 16px;color:#8e8e93;font-size:14px">${T('noWbAvailable')}</div>`;return}
																		  c.innerHTML=state.worldbooks.map(wb=>`<div class="wb-check-item" onclick="this.querySelector('.checkbox').classList.toggle('checked')"><div class="checkbox ${sel.includes(wb.id)?'checked':''}" data-wbid="${wb.id}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="li-info"><div class="li-title">${esc(wb.name)}</div><div class="li-sub">${wb.isGlobal?T('global'):T('local')}</div></div></div>`).join('')
																		}
																		function previewCharAvatar(inp){previewAvatarFile(inp,d=>{tmp.charAvatar=d;setAvatarPreview('charAvatarPv','charAvatarPh',d)})}
																		function saveChar(){
																		  const name=document.getElementById('charName').value.trim();if(!name){showToast(T('enterName'));return}
																		  const notes=document.getElementById('charNotes').value.trim(),sp=document.getElementById('charPromptArea').value.trim(),av=tmp.charAvatar,wbIds=[];
																		  document.querySelectorAll('#charWbList .checkbox.checked').forEach(cb=>wbIds.push(cb.dataset.wbid));
																		  if(state.editingCharId){const ch=state.characters.find(c=>c.id===state.editingCharId);if(ch)Object.assign(ch,{name,notes,systemPrompt:sp,avatar:av,worldbookIds:wbIds})}
																		  else{const nid=uid();state.characters.push({id:nid,name,notes,systemPrompt:sp,avatar:av,worldbookIds:wbIds});state.chats[nid]=[]}
																		  saveState();showToast(T('charSaved'));nav(state.charEditFrom||'screen-imessage')
																		}
																		function deleteChar(){
																		  if(!state.editingCharId)return;const cid=state.editingCharId,ch=state.characters.find(c=>c.id===cid),bk=JSON.parse(JSON.stringify(state.chats[cid]||[]));
																		  state.characters=state.characters.filter(c=>c.id!==cid);delete state.chats[cid];delete state.unread[cid];
																		  state.masks.forEach(m=>{m.charIds=(m.charIds||[]).filter(id=>id!==cid)});
																		  saveState();nav('screen-imessage');showSnackbar(T('deleted'),()=>{state.characters.push(ch);state.chats[cid]=bk;saveState();renderCharList()})
																		}

																		// ========== CHAT ==========
																		function openChat(cid){state.currentCharId=cid;state.unread[cid]=0;if(!state.chats[cid])state.chats[cid]=[];saveState();nav('screen-chat')}
																		function getUserAv(cid){const m=getMaskForChar(cid);return m?.avatar||state.userProfile.avatar||null}

																		// ========== CHAT BUBBLE BUILDERS ==========
																		function wrapBubble(side,avHtml,inner){return`<div class="msg-row ${side}"><div class="msg-avatar">${avHtml}</div>${inner}</div>`}
																		function buildVoiceBubble(content){
																		  return`<div class="msg-bubble voice" onclick="toggleVoiceText(this)"><div class="voice-row"><svg viewBox="0 0 20 20"><polygon points="4,2 18,10 4,18" fill="currentColor" stroke="none"/></svg><div class="voice-wave">${makeWaveBars()}</div></div><div class="voice-text">${esc(content)}</div></div>`
																		}
																		function buildStickerBubble(url){return`<div class="msg-bubble sticker-msg"><img src="${url}"></div>`}
																		function buildTransferBubble(amount,note,msgId,isSent,status){
																		  let h=`<div class="msg-bubble transfer-msg"><div class="transfer-card"><div class="tc-label">${T('transfer')}</div><div class="tc-amount">¥${esc(String(amount))}</div>${note?`<div class="tc-note">${esc(note)}</div>`:''}`;
																		  if(!isSent&&!status)h+=`<div class="transfer-actions"><button class="ta-accept" onclick="event.stopPropagation();acceptTransfer('${msgId}')">${T('accept')}</button><button class="ta-decline" onclick="event.stopPropagation();declineTransfer('${msgId}')">${T('decline')}</button></div>`;
																		  else if(status)h+=`<div class="transfer-status ${status}">${status==='accepted'?T('accepted'):T('declined')}</div>`;
																		  h+=`</div></div>`;return h
																		}
																		function buildSimImageBubble(content){return`<div class="msg-bubble sim-image-msg"><div class="sim-image-box"><svg viewBox="0 0 28 28"><rect x="2" y="2" width="24" height="24" rx="4" stroke-dasharray="3 2"/><path d="M8 14h12M14 8v12"/></svg><div class="sim-desc">${esc(content)}</div></div></div>`}
																		function buildImageBubble(src){return`<div class="msg-bubble image-msg"><img src="${src}"></div>`}
																		function buildTextBubble(content,msgId){return`<div class="msg-bubble" data-msgid="${msgId}" onclick="showMsgPopover(event,'${msgId}')">${fmtMsg(content)}</div>`}

																		function renderChat(){
    const ch=state.characters.find(c=>c.id===state.currentCharId);if(!ch)return;
    document.getElementById('chatName').textContent=ch.name;
    document.getElementById('chatAvatar').innerHTML=ch.avatar?`<img src="${ch.avatar}">`:'';
    const ct=document.getElementById('chatMessages'),msgs=state.chats[state.currentCharId]||[];
    const aH=msgAvatarHtml(ch.avatar),uA=getUserAv(state.currentCharId),uH=msgAvatarHtml(uA);
    const multiClass=bubbleState.multiMode?' multi-mode':'';
    let h='';

    msgs.forEach((msg,i)=>{
        if(i===0||(msg.timestamp-msgs[i-1].timestamp>300000))h+=`<div class="msg-time">${fmtTime(msg.timestamp)}</div>`;
        const sent=msg.role==='user',side=sent?'sent':'received',av=sent?uH:aH;
        const selected=bubbleState.selectedIds.has(msg.id)?'selected':'';
        const checkChecked=bubbleState.selectedIds.has(msg.id)?'checked':'';

        // 撤回消息
        if(msg.recalled||msg.type==='recalled'){
            h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">
                <div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div>
                <div class="msg-avatar">${av}</div>
                <div class="msg-bubble" style="opacity:.5;font-style:italic;font-size:12px">${esc(msg.content)}</div>
            </div>`;
            return;
        }

        // 引用內容
        let quoteHtml='';
        if(msg.quoteRef){
            const qm=msgs.find(m=>m.id===msg.quoteRef.id);
            quoteHtml=`<div class="msg-quote"><span class="mq-name">${esc(msg.quoteRef.name)}</span><br>${esc((qm?qm.content:msg.quoteRef.text||'').slice(0,40))}</div>`;
        }

        // 編輯標記
        let editedMark=msg.edited?'<span style="font-size:10px;opacity:.4;margin-left:6px">('+T('edited')+')</span>':'';

        if(sent){
            if(msg.type==='voice')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildVoiceBubble(msg.content)}</div>`;
            else if(msg.type==='sticker')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildStickerBubble(msg.content)}</div>`;
            else if(msg.type==='transfer'){const d=typeof msg.content==='string'&&msg.content.startsWith('{')?JSON.parse(msg.content):msg.content;h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildTransferBubble(d.amount||d,d.note||'',msg.id,true,msg.transferStatus)}</div>`}
            else if(msg.type==='image')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildImageBubble(msg.dataUrl||msg.content)}</div>`;
            else if(msg.type==='simImage')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildSimImageBubble(msg.content)}</div>`;
            else h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div><div class="msg-bubble" data-bubbleid="${msg.id}">${quoteHtml}${fmtMsg(msg.content)}${editedMark}</div></div>`;
        } else {
            const segs=parseReplySegments(msg.content,state.stickers);
segs.forEach((seg,segIdx)=>{
    const segBubbleId=msg.id+'__seg'+segIdx;
    if(seg.type==='sticker')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildStickerBubble(seg.url)}</div>`;
    else if(seg.type==='voice')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildVoiceBubble(seg.content)}</div>`;
    else if(seg.type==='transfer')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildTransferBubble(seg.amount,seg.note,msg.id,false,msg.transferStatus)}</div>`;
    else if(seg.type==='simImage')h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildSimImageBubble(seg.content)}</div>`;
    else h+=`<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div><div class="msg-bubble" data-bubbleid="${segBubbleId}">${quoteHtml}${fmtMsg(seg.content)}${editedMark}</div></div>`;
});
        }
    });
    ct.innerHTML=h;
    // 綁定長按事件
    ct.querySelectorAll('.msg-bubble[data-bubbleid]').forEach(el=>{
        initBubbleLongPress(el, el.dataset.bubbleid);
    });
    setTimeout(()=>ct.scrollTop=ct.scrollHeight,50);
}

																		function acceptTransfer(mid){const m=(state.chats[state.currentCharId]||[]).find(x=>x.id===mid);if(m){m.transferStatus='accepted';saveState();renderChat();showToast(T('accepted'))}}
																		function declineTransfer(mid){const m=(state.chats[state.currentCharId]||[]).find(x=>x.id===mid);if(m){m.transferStatus='declined';saveState();renderChat()}}
																		function toggleVoiceText(el){el.querySelector('.voice-text')?.classList.toggle('show')}
																		function autoGrow(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,100)+'px'}
																		function sendMessage(){
    const inp=document.getElementById('chatInput'),t=inp.value.trim();
    if(!t||!state.currentCharId)return;
    const msg = {id:uid(),role:'user',content:t,type:'text',timestamp:Date.now()};
    // 附帶引用
    if(bubbleState.quoteMsg){
        msg.quoteRef = { id: bubbleState.quoteMsg.id, name: bubbleState.quoteMsg.name, text: bubbleState.quoteMsg.text };
        clearQuote();
    }
    state.chats[state.currentCharId].push(msg);
    inp.value='';inp.style.height='auto';saveState();renderChat();
}
		function editCharFromChat(){if(state.currentCharId){state.charEditFrom='screen-chat';editChar(state.currentCharId)}}

																		// ========== BUBBLE MENU & MULTI-SELECT ==========
let bubbleState = { multiMode: false, selectedIds: new Set(), quoteMsg: null, editingMsgId: null };

// 長按觸發
let longPressTimer = null;
let longPressTarget = null;

function initBubbleLongPress(el, msgId) {
    el.addEventListener('touchstart', e => {
        longPressTarget = { el, msgId };
        longPressTimer = setTimeout(() => {
            e.preventDefault();
            if (bubbleState.multiMode) return;
            showBubbleMenu(el, msgId);
        }, 500);
    }, { passive: false });
    el.addEventListener('touchend', () => { clearTimeout(longPressTimer); });
    el.addEventListener('touchmove', () => { clearTimeout(longPressTimer); });
    // 桌面端右鍵
    el.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (bubbleState.multiMode) return;
        showBubbleMenu(el, msgId);
    });
    // 點擊（多選模式下切換選中）
    el.addEventListener('click', e => {
        if (bubbleState.multiMode) {
            e.stopPropagation();
            toggleBubbleSelect(msgId);
        }
    });
}

function showBubbleMenu(el, msgId) {
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
    if (!msg) return;
    const isSent = msg.role === 'user';
    const ch = state.characters.find(c => c.id === state.currentCharId);
    const sc = document.getElementById('screen-chat'), sr = sc.getBoundingClientRect();
    const br = el.getBoundingClientRect();
    const menu = document.getElementById('bubbleMenu');

    // 構建菜單項
    let items = '';
    // 引用
    items += `<div class="bm-item" onclick="quoteMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M4 8V5a4 4 0 018 0v1"/><path d="M2 8h5v6H2zM9 8h5v6H9z"/></svg>${T('quote')}</div>`;
    // 複製
    items += `<div class="bm-item" onclick="copyBubbleMsg('${msgId}')"><svg viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M5 11H3.5A1.5 1.5 0 012 9.5v-6A1.5 1.5 0 013.5 2h6A1.5 1.5 0 0111 3.5V5"/></svg>${T('copy')}</div>`;
    // 編輯
    items += `<div class="bm-item" onclick="startEditMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M11 2l3 3M2 11v3h3L13 6l-3-3L2 11z"/></svg>${T('edit')}</div>`;
    // 收藏
    items += `<div class="bm-item" onclick="toggleBookmarkMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M3 1h10a1 1 0 011 1v13l-6-3-6 3V2a1 1 0 011-1z"/></svg>${T('bookmark')}</div>`;
    // 多選
    items += `<div class="bm-item" onclick="enterMultiSelect('${msgId}')"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>${T('multiSelect')}</div>`;
    // 撤回（僅自己）
    if (isSent) {
        items += `<div class="bm-item danger" onclick="recallMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M3 8l3-3M3 8l3 3M3 8h10"/></svg>${T('recall')}</div>`;
    }
    // 刪除
    items += `<div class="bm-item danger" onclick="deleteBubbleMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>${T('delete')}</div>`;

    menu.innerHTML = items;

    // 定位
    let top = br.top - sr.top - menu.offsetHeight - 8;
    let left = isSent ? br.right - sr.left - 170 : br.left - sr.left;
    if (top < 60) top = br.bottom - sr.top + 8;
    if (left < 8) left = 8;
    if (left > sr.width - 170) left = sr.width - 170;
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.classList.add('open');
    document.getElementById('bubbleMenuOverlay').classList.add('show');
}

function closeBubbleMenu() {
    document.getElementById('bubbleMenu').classList.remove('open');
    document.getElementById('bubbleMenuOverlay').classList.remove('show');
}

// ===== 引用 =====
function quoteMsg(msgId) {
    closeBubbleMenu();
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
    if (!msg) return;
    const ch = state.characters.find(c => c.id === state.currentCharId);
    const name = msg.role === 'user' ? (state.userProfile.name || 'User') : (ch?.name || '');
    const text = (msg.content || '').slice(0, 60);
    bubbleState.quoteMsg = { id: msgId, name, text };
    document.getElementById('cqbText').innerHTML = `<span class="cqb-name">${esc(name)}</span> ${esc(text)}`;
    document.getElementById('chatQuoteBar').classList.add('show');
    document.getElementById('chatInput').focus();
}

function clearQuote() {
    bubbleState.quoteMsg = null;
    document.getElementById('chatQuoteBar').classList.remove('show');
}

// ===== 複製 =====
function copyBubbleMsg(msgId) {
    closeBubbleMenu();
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
    if (msg?.content) navigator.clipboard?.writeText(msg.content).catch(() => {});
    showToast(T('copied'));
}

// ===== 編輯 =====
function startEditMsg(msgId) {
    closeBubbleMenu();
    // 检查是否是段落编辑 (格式: realMsgId__segN)
    const segMatch = msgId.match(/^(.+)__seg(\d+)$/);
    if (segMatch) {
        const realId = segMatch[1];
        const segIdx = parseInt(segMatch[2]);
        const msg = (state.chats[state.currentCharId] || []).find(m => m.id === realId);
        if (!msg) return;
        const segs = parseReplySegments(msg.content, state.stickers);
        const targetSeg = segs[segIdx];
        if (!targetSeg || targetSeg.type !== 'text') { showToast('无法编辑'); return; }
        bubbleState.editingMsgId = msgId; // 存带 __seg 的完整ID
        document.getElementById('editMsgInput').value = targetSeg.content || '';
        document.getElementById('editMsgModal').classList.add('show');
        setTimeout(() => document.getElementById('editMsgInput').focus(), 100);
    } else {
        const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
        if (!msg || msg.type !== 'text') { showToast('无法编辑'); return; }
        bubbleState.editingMsgId = msgId;
        document.getElementById('editMsgInput').value = msg.content || '';
        document.getElementById('editMsgModal').classList.add('show');
        setTimeout(() => document.getElementById('editMsgInput').focus(), 100);
    }
}

// ===== 撤回 =====
function recallMsg(msgId) {
    closeBubbleMenu();
    const msgs = state.chats[state.currentCharId] || [];
    const msg = msgs.find(m => m.id === msgId);
    if (msg) {
        msg.recalled = true;
        msg.originalContent = msg.content;
        msg.content = T('recalledMsg');
        msg.type = 'recalled';
        saveState();
        renderChat();
        showToast(T('recalled'));
    }
}

// ===== 刪除 =====
function deleteBubbleMsg(msgId) {
    closeBubbleMenu();
    const msgs = state.chats[state.currentCharId] || [];
    const idx = msgs.findIndex(m => m.id === msgId);
    if (idx === -1) return;
    const del = msgs.splice(idx, 1)[0];
    saveState(); renderChat();
    showSnackbar(T('msgDeleted'), () => { msgs.splice(idx, 0, del); saveState(); renderChat(); });
}

// ===== 收藏 =====
function toggleBookmarkMsg(msgId) {
    closeBubbleMenu();
    if (!state.bookmarks) state.bookmarks = [];
    const ch = state.characters.find(c => c.id === state.currentCharId);
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
    if (!msg) return;
    const existing = state.bookmarks.findIndex(b => b.msgId === msgId && b.charId === state.currentCharId);
    if (existing >= 0) {
        state.bookmarks.splice(existing, 1);
        saveState();
        showToast(T('unbookmarked'));
    } else {
        state.bookmarks.push({
            id: uid(),
            msgId: msgId,
            charId: state.currentCharId,
            charName: ch?.name || '',
            charAvatar: ch?.avatar || null,
            role: msg.role,
            content: msg.content,
            type: msg.type,
            timestamp: msg.timestamp,
            bookmarkedAt: Date.now()
        });
        saveState();
        showToast(T('bookmarked'));
    }
}

// ===== 多選模式 =====
function enterMultiSelect(firstMsgId) {
    closeBubbleMenu();
    bubbleState.multiMode = true;
    bubbleState.selectedIds = new Set([firstMsgId]);
    document.getElementById('chatHeaderNormal').style.display = 'none';
    document.getElementById('bubbleActionBar').classList.add('show');
    renderChat();
    updateMultiCount();
}

function exitMultiSelect() {
    bubbleState.multiMode = false;
    bubbleState.selectedIds.clear();
    document.getElementById('chatHeaderNormal').style.display = '';
    document.getElementById('bubbleActionBar').classList.remove('show');
    renderChat();
}

function toggleBubbleSelect(msgId) {
    if (bubbleState.selectedIds.has(msgId)) bubbleState.selectedIds.delete(msgId);
    else bubbleState.selectedIds.add(msgId);
    updateMultiCount();
    // 更新 UI
    document.querySelectorAll('.msg-row').forEach(row => {
        const mid = row.dataset.msgid;
        if (mid) {
            row.classList.toggle('selected', bubbleState.selectedIds.has(mid));
            const ck = row.querySelector('.msg-check');
            if (ck) ck.classList.toggle('checked', bubbleState.selectedIds.has(mid));
        }
    });
}

function updateMultiCount() {
    document.getElementById('babCount').textContent = bubbleState.selectedIds.size + ' ' + T('selectedCount');
}

function deleteSelected() {
    const msgs = state.chats[state.currentCharId] || [];
    const ids = [...bubbleState.selectedIds];
    const deleted = [];
    ids.forEach(id => {
        const idx = msgs.findIndex(m => m.id === id);
        if (idx >= 0) deleted.push({ idx, msg: msgs.splice(idx, 1)[0] });
    });
    saveState();
    exitMultiSelect();
    renderChat();
    showSnackbar(deleted.length + ' ' + T('msgDeleted'), () => {
        deleted.sort((a, b) => a.idx - b.idx).forEach(d => msgs.splice(d.idx, 0, d.msg));
        saveState(); renderChat();
    });
}

function bookmarkSelected() {
    if (!state.bookmarks) state.bookmarks = [];
    const ch = state.characters.find(c => c.id === state.currentCharId);
    const msgs = state.chats[state.currentCharId] || [];
    let count = 0;
    bubbleState.selectedIds.forEach(id => {
        if (state.bookmarks.some(b => b.msgId === id && b.charId === state.currentCharId)) return;
        const msg = msgs.find(m => m.id === id);
        if (!msg) return;
        state.bookmarks.push({
            id: uid(), msgId: id, charId: state.currentCharId,
            charName: ch?.name || '', charAvatar: ch?.avatar || null,
            role: msg.role, content: msg.content, type: msg.type,
            timestamp: msg.timestamp, bookmarkedAt: Date.now()
        });
        count++;
    });
    saveState();
    exitMultiSelect();
    showToast(count + ' ' + T('bookmarked'));
}

// ===== 收藏列表 =====
function renderBookmarkList() {
    const el = document.getElementById('bookmarkListBody');
    const bks = (state.bookmarks || []).filter(b => b.charId === state.currentCharId).sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
    if (!bks.length) {
        el.innerHTML = `<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M12 4h24a2 2 0 012 2v36l-14-7-14 7V6a2 2 0 012-2z"/></svg><p>${T('noBookmarks')}</p></div>`;
        return;
    }
    el.innerHTML = '<div class="list-group">' + bks.map(b => `<div class="bookmark-list-item">
        <div class="bli-avatar">${b.charAvatar ? `<img src="${b.charAvatar}">` : PERSON_SVG}</div>
        <div class="bli-info">
            <div class="bli-name">${esc(b.role === 'user' ? (state.userProfile.name || 'User') : b.charName)}</div>
            <div class="bli-text">${esc((b.content || '').slice(0, 100))}</div>
            <div class="bli-time">${fmtTime(b.timestamp)}</div>
        </div>
        <button class="bli-del" onclick="removeBookmark('${b.id}')"><svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg></button>
    </div>`).join('') + '</div>';
}

function removeBookmark(bid) {
    state.bookmarks = (state.bookmarks || []).filter(b => b.id !== bid);
    saveState();
    renderBookmarkList();
    showToast(T('unbookmarked'));
}
								// ========== TRANSFER / IMAGE MODALS ==========
																		function openTransferModal(){closePlusMenu();document.getElementById('transferAmount').value='';document.getElementById('transferNote').value='';document.getElementById('transferModal').classList.add('show')}
																		function sendTransfer(){const amt=document.getElementById('transferAmount').value.trim();if(!amt||!state.currentCharId)return;const note=document.getElementById('transferNote').value.trim();state.chats[state.currentCharId].push({id:uid(),role:'user',content:JSON.stringify({amount:amt,note}),type:'transfer',timestamp:Date.now()});saveState();closeModal('transferModal');renderChat()}
																		function openImageModal(){closePlusMenu();setImgType('real');document.getElementById('realImagePreview').style.display='none';document.getElementById('simImageText').value='';tmp.realImageData=null;document.getElementById('imageModal').classList.add('show')}
																		function setImgType(t){tmp.imgType=t;document.getElementById('imgTypeReal').classList.toggle('active',t==='real');document.getElementById('imgTypeSim').classList.toggle('active',t==='sim');document.getElementById('imgRealArea').style.display=t==='real'?'block':'none';document.getElementById('imgSimArea').style.display=t==='sim'?'block':'none'}
																		function previewRealImage(inp){if(inp.files?.[0]){const r=new FileReader();r.onload=e=>{tmp.realImageData=e.target.result;document.getElementById('realImagePreview').src=e.target.result;document.getElementById('realImagePreview').style.display='block'};r.readAsDataURL(inp.files[0])}}
																		function sendImage(){
																		  if(!state.currentCharId)return;
																		  if(tmp.imgType==='real'){if(!tmp.realImageData)return;state.chats[state.currentCharId].push({id:uid(),role:'user',content:'[User sent a real photo]',type:'image',dataUrl:tmp.realImageData,timestamp:Date.now()})}
																		  else{const text=document.getElementById('simImageText').value.trim();if(!text)return;state.chats[state.currentCharId].push({id:uid(),role:'user',content:text,type:'simImage',timestamp:Date.now()})}
																		  saveState();closeModal('imageModal');renderChat()
																		}

																		async function triggerResponse(){
  if(!state.currentCharId)return;
  const api=state.apis.find(a=>a.id===state.activeApiId);
  if(!api?.url){showErrorModal(T('configApi'));return}
  if(!api.model){showErrorModal(T('selectModel'));return}
  const ch=state.characters.find(c=>c.id===state.currentCharId);if(!ch)return;
  const btn=document.getElementById('respondBtn');btn.classList.add('loading');btn.disabled=true;
  const ct=document.getElementById('chatMessages');
  const typ=document.createElement('div');typ.className='msg-row received';typ.id='typingInd';
  typ.innerHTML=`<div class="msg-avatar">${msgAvatarHtml(ch.avatar)}</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  ct.appendChild(typ);ct.scrollTop=ct.scrollHeight;
  try{
    const sysPrompt=buildSystemPrompt(ch,state.worldbooks,state.stickers);
    const charCfg=getCharConfig(state.currentCharId);
    const contextCount=charCfg.contextCount||50;
    const allChatMsgs=(state.chats[state.currentCharId]||[]).map(m=>{
        if(m.type==='voice')return{role:m.role,content:`[Voice]: ${m.content}`};
        if(m.type==='sticker')return{role:m.role,content:'[Sent sticker]'};
        if(m.type==='transfer'){const d=typeof m.content==='string'&&m.content.startsWith('{')?JSON.parse(m.content):m.content;return{role:m.role,content:`[Transfer ¥${d.amount||d}${d.note?' '+d.note:''}]${m.transferStatus?' ('+m.transferStatus+')':''}`}}
        if(m.type==='image')return{role:m.role,content:m.content};
        if(m.type==='simImage')return{role:m.role,content:`[Image: ${m.content}]`};
        return{role:m.role,content:m.content}
    });
    const chatMsgs=allChatMsgs.slice(-contextCount);
    const reply = await sendChat(api, [
        { role: 'system', content: sysPrompt },
        ...chatMsgs
    ]);
    state.chats[state.currentCharId].push({id:uid(),role:'assistant',content:reply||'...',type:'text',timestamp:Date.now()});
    saveState();
    checkAutoSummarize();
  }catch(e){
    showErrorModal(friendlyError(e));
  }finally{
    const ti=document.getElementById('typingInd');if(ti)ti.remove();
    btn.classList.remove('loading');btn.disabled=false;
    renderChat();
  }
}

																										// ========== PLUS MENU / STICKERS / VOICE ==========
																		function togglePlusMenu(){document.getElementById('plusMenu').classList.toggle('show');document.getElementById('plusMenuOverlay').classList.toggle('show')}
																		function closePlusMenu(){document.getElementById('plusMenu')?.classList.remove('show');document.getElementById('plusMenuOverlay')?.classList.remove('show')}
																		function openVoiceModal(){closePlusMenu();document.getElementById('voiceText').value='';document.getElementById('voiceModal').classList.add('show')}
																		function sendVoice(){const t=document.getElementById('voiceText').value.trim();if(!t||!state.currentCharId)return;state.chats[state.currentCharId].push({id:uid(),role:'user',content:t,type:'voice',timestamp:Date.now()});saveState();closeModal('voiceModal');renderChat()}
																		function openStickerPanel(){closePlusMenu();renderStickerGrid();document.getElementById('stickerPanel').classList.add('show');document.getElementById('stickerPanel').classList.remove('manage')}
																		function closeStickerPanel(){document.getElementById('stickerPanel')?.classList.remove('show','manage')}
																		function renderStickerGrid(){
																		  const g=document.getElementById('stickerGrid');
																		  if(!state.stickers.length){g.innerHTML='<div class="sticker-empty">No stickers</div>';return}
																		  g.innerHTML=state.stickers.map(s=>`<div class="sticker-item" onclick="sendSticker('${s.id}')"><img src="${s.dataUrl}"><div class="sticker-name">${esc(s.name)}</div><button class="sticker-del" onclick="event.stopPropagation();delSticker('${s.id}')"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6"/></svg></button></div>`).join('')
																		}
																		function sendSticker(sid){const s=state.stickers.find(x=>x.id===sid);if(!s||!state.currentCharId)return;state.chats[state.currentCharId].push({id:uid(),role:'user',content:s.dataUrl,type:'sticker',timestamp:Date.now()});saveState();closeStickerPanel();renderChat()}
																		function delSticker(sid){state.stickers=state.stickers.filter(s=>s.id!==sid);saveState();renderStickerGrid()}
																		function toggleStickerManage(){const p=document.getElementById('stickerPanel');p.classList.toggle('manage');document.getElementById('stickerManageBtn').textContent=p.classList.contains('manage')?T('done'):T('manage')}

																		// ========== WORLDBOOK ==========
																		function renderWbList(){
																		  const body=document.getElementById('wbListBody');
																		  if(!state.worldbooks.length){body.innerHTML=`<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M8 6h12a4 4 0 014 4v28s-3-4-10-4H8V6z"/><path d="M40 6H28a4 4 0 00-4 4v28s3-4 10-4h6V6z"/></svg><p>${T('noWorldbooks')}<br>${T('tapCreateWb')}</p></div>`;return}
																		  const g={};state.worldbooks.forEach(wb=>{const k=wb.group||'—';if(!g[k])g[k]=[];g[k].push(wb)});
																		  let h='';Object.keys(g).sort().forEach(k=>{h+=`<div class="section-header">${esc(k)}</div><div class="list-group">`;g[k].forEach(wb=>{h+=`<div class="list-item" onclick="editWb('${wb.id}')"><div class="li-info"><div class="li-title">${esc(wb.name)}</div><div class="li-sub">${esc((wb.content||'').slice(0,40))}</div></div><span class="tag ${wb.isGlobal?'global':'local'}">${wb.isGlobal?T('global'):T('local')}</span><span class="li-arrow">›</span></div>`});h+='</div>'});
																		  body.innerHTML=h+'<div style="height:60px"></div>'
																		}
																		function editWb(id){
																		  state.editingWbId=id;const wb=id?state.worldbooks.find(w=>w.id===id):null;
																		  document.getElementById('wbEditTitle').textContent=wb?T('editWb'):T('newWb');
																		  document.getElementById('wbName').value=wb?wb.name:'';document.getElementById('wbGroup').value=wb?(wb.group||''):'';
																		  document.getElementById('wbContentArea').value=wb?(wb.content||''):'';document.getElementById('deleteWbBtn').style.display=wb?'block':'none';
																		  tmp.wbGlobal=wb?wb.isGlobal:false;tmp.wbEntries=wb?JSON.parse(JSON.stringify(wb.entries||[])):[];
																		  document.getElementById('wbGlobalToggle').classList.toggle('on',tmp.wbGlobal);renderWbEntries();nav('screen-wb-edit')
																		}
																		function toggleWbGlobal(){tmp.wbGlobal=!tmp.wbGlobal;document.getElementById('wbGlobalToggle').classList.toggle('on',tmp.wbGlobal)}
																		function renderWbEntries(){
																		  const b=document.getElementById('wbEntriesBody');
																		  if(!tmp.wbEntries.length){b.innerHTML=`<div style="text-align:center;color:#8e8e93;padding:16px;font-size:14px">${T('noEntries')}</div>`;return}
																		  let h='<div class="list-group">';tmp.wbEntries.forEach((e,i)=>{h+=`<div class="list-item" style="align-items:flex-start"><div class="li-info"><div class="li-title" contenteditable="true" oninput="tmp.wbEntries[${i}].keyword=this.textContent" style="outline:none;min-width:40px">${esc(e.keyword||'')}</div><div class="li-sub" contenteditable="true" oninput="tmp.wbEntries[${i}].content=this.textContent" style="outline:none;white-space:normal">${esc(e.content||'')}</div></div><button onclick="rmWbEntry(${i})" style="background:none;border:none;cursor:pointer;padding:8px"><svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:#ff3b30;fill:none;stroke-width:2"><circle cx="10" cy="10" r="8"/><path d="M7 10h6"/></svg></button></div>`});
																		  b.innerHTML=h+'</div>'
																		}
																		function addWbEntry(){tmp.wbEntries.push({id:uid(),keyword:'',content:''});renderWbEntries();showToast(T('entryAdded'))}
																		function rmWbEntry(i){tmp.wbEntries.splice(i,1);renderWbEntries()}
																		function saveWb(){
																		  const name=document.getElementById('wbName').value.trim();if(!name){showToast(T('enterName'));return}
																		  const group=document.getElementById('wbGroup').value.trim(),content=document.getElementById('wbContentArea').value.trim();
																		  if(state.editingWbId){const wb=state.worldbooks.find(w=>w.id===state.editingWbId);if(wb)Object.assign(wb,{name,group,content,isGlobal:tmp.wbGlobal,entries:tmp.wbEntries})}
																		  else state.worldbooks.push({id:uid(),name,group,content,isGlobal:tmp.wbGlobal,entries:tmp.wbEntries});
																		  saveState();showToast(T('wbSaved'));nav('screen-worldbook')
																		}
																		function deleteWb(){
																		  if(!state.editingWbId)return;const wid=state.editingWbId,bk=JSON.parse(JSON.stringify(state.worldbooks.find(w=>w.id===wid)));
																		  state.worldbooks=state.worldbooks.filter(w=>w.id!==wid);
																		  state.characters.forEach(ch=>{if(ch.worldbookIds)ch.worldbookIds=ch.worldbookIds.filter(id=>id!==wid)});
																		  saveState();nav('screen-worldbook');showSnackbar(T('deleted'),()=>{state.worldbooks.push(bk);saveState();renderWbList()})
																		}

																		// ========== PHONE TIME ==========
																		function updatePhoneTime(){
																		  const now=new Date();
																		  const el=document.getElementById('phoneTime');
																		  if(el)el.textContent=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
																		  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
																		  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
																		  const del=document.getElementById('phoneDate');
																		  if(del)del.textContent=days[now.getDay()]+', '+months[now.getMonth()]+' '+now.getDate()
																		}
																		// ========== HOME PAGE SWIPE ==========
let homePageIndex=0;
function initHomeSwipe(){
  const pages=document.getElementById('homePages');if(!pages)return;
  let startX=0,startY=0,diffX=0,moving=false;
  pages.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;moving=true;diffX=0});
  pages.addEventListener('touchmove',e=>{
    if(!moving)return;
    diffX=e.touches[0].clientX-startX;
    const diffY=e.touches[0].clientY-startY;
    if(Math.abs(diffX)>Math.abs(diffY)&&Math.abs(diffX)>10)e.preventDefault();
  },{passive:false});
  pages.addEventListener('touchend',()=>{
    if(!moving)return;moving=false;
    if(diffX<-50&&homePageIndex<1){homePageIndex=1;updateHomePages()}
    else if(diffX>50&&homePageIndex>0){homePageIndex=0;updateHomePages()}
  });
}
function updateHomePages(){
  document.getElementById('homePage1').style.transform=`translateX(${-homePageIndex*100}%)`;
  document.getElementById('homePage2').style.transform=`translateX(${-homePageIndex*100}%)`;
  document.getElementById('homeDot0').classList.toggle('active',homePageIndex===0);
  document.getElementById('homeDot1').classList.toggle('active',homePageIndex===1);
}

// ========== HOME WIDGETS ==========
function setHomeBanner(inp){if(inp.files?.[0]){const r=new FileReader();r.onload=e=>{const img=document.getElementById('homeBannerImg');img.src=e.target.result;img.style.display='block';state.userProfile.banner=e.target.result;saveState()};r.readAsDataURL(inp.files[0])}}
function setHomeAvatar(inp){if(inp.files?.[0]){const r=new FileReader();r.onload=e=>{state.userProfile.avatar=e.target.result;saveState();renderHomeProfile()};r.readAsDataURL(inp.files[0])}}
function renderHomeProfile(){
  const u=state.userProfile;
  const img=document.getElementById('homeAvatarImg'),ph=document.getElementById('homeAvatarPh');
  if(u.avatar){img.src=u.avatar;img.style.display='block';ph.style.display='none'}else{img.style.display='none';ph.style.display='block'}
  document.getElementById('homeUserName').textContent=u.name||'User';
  document.getElementById('homeUserBio').textContent=u.bio||'Tap to add signature';
  if(u.banner){const bi=document.getElementById('homeBannerImg');bi.src=u.banner;bi.style.display='block'}
}
function startEditHomeName(){
  document.getElementById('nameModalInput').value=state.userProfile.name||'';
  document.getElementById('nameModal').classList.add('show');
  document.getElementById('nameModalInput').focus();
  window._nameTarget='home';
}
function startEditHomeBio(){
  const v=prompt('Signature:',(state.userProfile.bio||''));
  if(v!==null){state.userProfile.bio=v;saveState();renderHomeProfile()}
}

// ========== GREETING WIDGET ==========
function setGreetingBg(inp){if(inp.files?.[0]){const r=new FileReader();r.onload=e=>{const img=document.getElementById('greetingBgImg');img.src=e.target.result;img.style.display='block'};r.readAsDataURL(inp.files[0])}}
function updateGreeting(){
  const h=new Date().getHours();
  let t='Good Evening';
  if(h>=5&&h<12)t='Good Morning';else if(h>=12&&h<18)t='Good Afternoon';
  document.getElementById('greetingText').textContent=t;
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today=new Date().getDay();
  document.getElementById('greetingDots').innerHTML=days.map((d,i)=>`<div class="gw-day${i===today?' today':''}"><span>${d}</span><div class="gd-dot"></div></div>`).join('');
}

// ========== MUSIC WIDGET ==========
function setMusicCover(inp){if(inp.files?.[0]){const r=new FileReader();r.onload=e=>{const img=document.getElementById('musicCoverImg');img.src=e.target.result;img.style.display='block';state.userProfile.musicCover=e.target.result;saveState()};r.readAsDataURL(inp.files[0])}}
function editMusicInfo(type){
  const key=type==='song'?'musicSong':'musicArtist';
  const cur=state.userProfile[key]||'';
  const v=prompt(type==='song'?'Song name:':'Artist:',cur);
  if(v!==null){state.userProfile[key]=v;saveState();document.getElementById(key==='musicSong'?'musicSong':'musicArtist').textContent=v||( type==='song'?'Song Title':'Artist')}
}

// ========== CALENDAR WIDGET ==========
function updateCalendar(){
  const now=new Date();
  const months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  document.getElementById('calMonth').textContent=months[now.getMonth()];
  document.getElementById('calDate').textContent=now.getDate();
  document.getElementById('calWeekday').textContent=days[now.getDay()];
}
function editCalEvent(){
  const v=prompt('Event name:',state.userProfile.calEvent||'');
  if(v!==null){
    state.userProfile.calEvent=v;
    if(v){
      const d=prompt('Days until event:','0');
      state.userProfile.calDays=parseInt(d)||0;
    }
    saveState();renderCalEvent()
  }
}
function renderCalEvent(){
  const ev=state.userProfile.calEvent;
  const el=document.getElementById('calEvent'),cd=document.getElementById('calCountdown');
  if(ev){el.textContent=ev;cd.textContent=state.userProfile.calDays||0;cd.style.display='block'}
  else{el.textContent='Tap to set event';cd.style.display='none'}
}


																		// ========== INIT ==========
																		loadState();
																		initHomeSwipe();
updateGreeting();
updateCalendar();
renderHomeProfile();
renderCalEvent();
if(state.userProfile.musicSong)document.getElementById('musicSong').textContent=state.userProfile.musicSong;
if(state.userProfile.musicArtist)document.getElementById('musicArtist').textContent=state.userProfile.musicArtist;
if(state.userProfile.musicCover){const mi=document.getElementById('musicCoverImg');mi.src=state.userProfile.musicCover;mi.style.display='block'}

																		applyLang();

																		document.getElementById('chatInput')?.addEventListener('keydown', function(e) {
																		  if (e.key === 'Enter' && !e.shiftKey) {
																		    e.preventDefault();
																		    sendMessage();
																		  }
																		});

																		updateHomeBadge();
																		switchImsgTab(state.imsgTab || 'messages');
																		updatePhoneTime();
																		setInterval(updatePhoneTime, 30000);
																		// ========== PHONE APP REGISTRY ==========
const PHONE_APPS = {
    wechat: {
        id: 'wechat',
        name: { en: 'WeChat', zh: '微信' },
        icon: 'msg',
        iconClass: 'pi-msg',
        prompt: `Generate this character's WeChat/messaging app data. Include:
- 3-5 recent chat threads with different contacts (friends, family, coworkers, etc.)
- Each thread has 2-4 recent messages
- Some unread messages
- Messages should reflect the character's social relationships and communication style

Return JSON:
{"chats":[{"contact":"Name","avatar_desc":"brief description","unread":0,"messages":[{"from":"name","text":"content","time":"HH:MM"}]}]}`,
        getCount(data) { return data?.chats?.reduce((n,c)=>n+(c.unread||0),0)||0 },
        renderList(data, charName) {
            if(!data?.chats?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3);font-size:14px">No messages</div>';
            return data.chats.map((c,i)=>`<div style="display:flex;align-items:center;padding:14px 16px;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('wechat',${i})">
                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">${(c.contact||'?')[0]}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between"><span style="color:#fff;font-size:15px;font-weight:500">${esc(c.contact)}</span><span style="color:rgba(255,255,255,.3);font-size:11px">${c.messages?.length?c.messages[c.messages.length-1].time:''}</span></div>
                    <div style="color:rgba(255,255,255,.4);font-size:13px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.messages?.length?c.messages[c.messages.length-1].text:'')}</div>
                </div>
                ${c.unread?`<div style="min-width:18px;height:18px;background:#ff3b30;color:#fff;font-size:10px;font-weight:700;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px">${c.unread}</div>`:''}
            </div>`).join('');
        },
        renderDetail(data, index) {
            const chat = data?.chats?.[index]; if(!chat) return '';
            return `<div style="padding:12px 16px">
                <div style="text-align:center;color:rgba(255,255,255,.3);font-size:12px;margin-bottom:16px">${esc(chat.contact)}</div>
                ${(chat.messages||[]).map(m=>{
                    const isChar = m.from !== 'User' && m.from !== 'user';
                    return `<div style="display:flex;margin-bottom:10px;${isChar?'':'flex-direction:row-reverse'}">
                        <div style="max-width:70%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.4;${isChar?'background:rgba(255,255,255,.08);color:#fff;border-bottom-left-radius:4px':'background:rgba(255,255,255,.15);color:#fff;border-bottom-right-radius:4px'}">
                            ${esc(m.text)}
                            <div style="font-size:10px;opacity:.4;margin-top:4px;text-align:right">${m.time||''}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        }
    },
    gallery: {
        id: 'gallery',
        name: { en: 'Photos', zh: '相冊' },
        icon: 'photos',
        iconClass: 'pi-photos',
        prompt: `Generate this character's photo gallery data. Include:
- 6-10 recent photos
- Each photo has a text description of what it shows
- Include time and optional location
- Photos should reflect the character's life, hobbies, and recent activities

Return JSON:
{"photos":[{"desc":"what the photo shows","time":"YYYY-MM-DD HH:MM","location":"optional place"}]}`,
        getCount(data) { return data?.photos?.length||0 },
        renderList(data) {
            if(!data?.photos?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No photos</div>';
            return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px">${data.photos.map((p,i)=>`<div style="aspect-ratio:1;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:8px;font-size:11px;color:rgba(255,255,255,.4);text-align:center;line-height:1.3" onclick="openPhoneAppDetail('gallery',${i})">${esc((p.desc||'').slice(0,30))}</div>`).join('')}</div>`;
        },
        renderDetail(data, index) {
            const p = data?.photos?.[index]; if(!p) return '';
            return `<div style="padding:20px;text-align:center">
                <div style="aspect-ratio:4/3;background:rgba(255,255,255,.06);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:20px;margin-bottom:16px">
                    <div style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.5">${esc(p.desc)}</div>
                </div>
                <div style="color:rgba(255,255,255,.4);font-size:13px">${p.time||''}</div>
                ${p.location?`<div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:4px">📍 ${esc(p.location)}</div>`:''}
            </div>`;
        }
    },
    wallet: {
        id: 'wallet',
        name: { en: 'Wallet', zh: '錢包' },
        icon: 'wallet',
        iconClass: 'pi-wallet',
        prompt: `Generate this character's wallet/payment app data. Include:
- Current balance
- 5-8 recent transactions
- Each transaction has merchant name, amount (negative for spending, positive for income), time, and category

Return JSON:
{"balance":"1234.56","transactions":[{"merchant":"Store name","amount":"-45.00","time":"YYYY-MM-DD HH:MM","category":"food/transport/shopping/entertainment/transfer"}]}`,
        getCount(data) { return data?.transactions?.length||0 },
        renderList(data) {
            if(!data) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No data</div>';
            let h = `<div style="padding:24px;text-align:center"><div style="color:rgba(255,255,255,.4);font-size:12px">Balance</div><div style="color:#fff;font-size:32px;font-weight:200;margin-top:4px">¥${esc(data.balance||'0')}</div></div>`;
            h += (data.transactions||[]).map((t,i)=>`<div style="display:flex;align-items:center;padding:14px 16px;gap:12px;border-top:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('wallet',${i})">
                <div style="flex:1"><div style="color:#fff;font-size:14px">${esc(t.merchant)}</div><div style="color:rgba(255,255,255,.3);font-size:11px;margin-top:2px">${t.time||''}</div></div>
                <div style="color:${String(t.amount).startsWith('-')?'#ff6b6b':'#51cf66'};font-size:15px;font-weight:600">${t.amount?.startsWith?.('-')?'':'+'} ¥${esc(String(t.amount).replace(/^[+-]/,''))}</div>
            </div>`).join('');
            return h;
        },
        renderDetail(data, index) {
            const t = data?.transactions?.[index]; if(!t) return '';
            return `<div style="padding:30px;text-align:center">
                <div style="font-size:36px;font-weight:200;color:${String(t.amount).startsWith('-')?'#ff6b6b':'#51cf66'};margin-bottom:16px">¥${esc(String(t.amount).replace(/^[+-]/,''))}</div>
                <div style="color:#fff;font-size:16px;font-weight:500">${esc(t.merchant)}</div>
                <div style="color:rgba(255,255,255,.4);font-size:13px;margin-top:8px">${t.time||''}</div>
                <div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:4px">${esc(t.category||'')}</div>
            </div>`;
        }
    },
    notes: {
        id: 'notes',
        name: { en: 'Notes', zh: '備忘錄' },
        icon: 'notes',
        iconClass: 'pi-notes',
        prompt: `Generate this character's notes app data. Include:
- 3-5 notes
- Mix of to-do lists, personal thoughts, drafts, reminders
- Content should reflect the character's inner world and daily life

Return JSON:
{"notes":[{"title":"Note title","content":"Note content with \\n for newlines","time":"YYYY-MM-DD HH:MM"}]}`,
        getCount(data) { return data?.notes?.length||0 },
        renderList(data) {
            if(!data?.notes?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No notes</div>';
            return data.notes.map((n,i)=>`<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('notes',${i})">
                <div style="color:#fff;font-size:15px;font-weight:500">${esc(n.title)}</div>
                <div style="color:rgba(255,255,255,.35);font-size:12px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((n.content||'').replace(/\\n/g,' ').slice(0,50))}</div>
                <div style="color:rgba(255,255,255,.25);font-size:11px;margin-top:4px">${n.time||''}</div>
            </div>`).join('');
        },
        renderDetail(data, index) {
            const n = data?.notes?.[index]; if(!n) return '';
            return `<div style="padding:20px"><div style="color:#fff;font-size:18px;font-weight:600;margin-bottom:12px">${esc(n.title)}</div><div style="color:rgba(255,255,255,.7);font-size:14px;line-height:1.6;white-space:pre-wrap">${esc((n.content||'').replace(/\\n/g,'\n'))}</div><div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:16px">${n.time||''}</div></div>`;
        }
    },
    browser: {
        id: 'browser',
        name: { en: 'Browser', zh: '瀏覽器' },
        icon: 'browser',
        iconClass: 'pi-browser',
        prompt: `Generate this character's browser history. Include:
- 6-10 recent searches/visited pages
- Should reflect the character's interests, concerns, and recent activities
- Mix of searches and website visits

Return JSON:
{"history":[{"title":"Page title or search query","url":"example.com","time":"YYYY-MM-DD HH:MM","isSearch":true}]}`,
        getCount(data) { return data?.history?.length||0 },
        renderList(data) {
            if(!data?.history?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No history</div>';
            return data.history.map((h,i)=>`<div style="display:flex;align-items:center;padding:12px 16px;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('browser',${i})">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px">${h.isSearch?'🔍':'🌐'}</div>
                <div style="flex:1;min-width:0">
                    <div style="color:#fff;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.title)}</div>
                    <div style="color:rgba(255,255,255,.25);font-size:11px;margin-top:2px">${esc(h.url||'')} · ${h.time||''}</div>
                </div>
            </div>`).join('');
        },
        renderDetail(data, index) {
            const h = data?.history?.[index]; if(!h) return '';
            return `<div style="padding:20px;text-align:center"><div style="font-size:16px;color:#fff;margin-bottom:8px">${esc(h.title)}</div><div style="color:rgba(255,255,255,.3);font-size:13px">${esc(h.url||'')}</div><div style="color:rgba(255,255,255,.25);font-size:12px;margin-top:8px">${h.time||''}</div></div>`;
        }
    }
};

// Icon SVG paths (keep for home screen rendering)
const PHONE_ICON_SVG = {
    msg:'<path d="M4 4h18a1 1 0 011 1v11a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>',
    phone:'<path d="M6 4c0 0-2 3-2 5s3 6 6 9 7 5 9 5 5-2 5-2l-3-4-3 2c-1 0-4-2-6-4s-4-5-4-6l2-3L6 4z"/>',
    contacts:'<circle cx="13" cy="9" r="4"/><path d="M5 22c0-4 3.5-7 8-7s8 3 8 7"/>',
    browser:'<circle cx="13" cy="13" r="10"/><path d="M3 13h20"/><path d="M13 3c-3 3-4 6-4 10s1 7 4 10"/><path d="M13 3c3 3 4 6 4 10s-1 7-4 10"/>',
    photos:'<rect x="3" y="5" width="20" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M3 18l5-5 3 3 5-6 7 8"/>',
    camera:'<path d="M4 8h3l2-3h8l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="13" cy="14" r="4"/>',
    music:'<path d="M9 20V6l12-3v14"/><circle cx="7" cy="20" r="3"/><circle cx="19" cy="17" r="3"/>',
    video:'<rect x="2" y="6" width="16" height="14" rx="2"/><path d="M18 10l6-3v12l-6-3"/>',
    notes:'<rect x="4" y="3" width="18" height="20" rx="2"/><path d="M8 8h10M8 12h10M8 16h6"/>',
    wallet:'<rect x="2" y="6" width="22" height="15" rx="2"/><path d="M2 11h22"/><circle cx="19" cy="16" r="1.5" fill="rgba(255,255,255,.6)" stroke="none"/>',
    shop:'<path d="M4 7l2-4h14l2 4"/><rect x="3" y="7" width="20" height="15" rx="1"/><path d="M10 7v3a3 3 0 006 0V7"/>',
    maps:'<path d="M13 3C9 3 6 6.5 6 10c0 5 7 13 7 13s7-8 7-13c0-3.5-3-7-7-7z"/><circle cx="13" cy="10" r="2.5"/>',
    travel:'<path d="M13 3v7l6 3-6 3v7l-10-10z"/><path d="M13 3v7l-6 3 6 3v7"/>',
    calendar:'<rect x="3" y="5" width="20" height="18" rx="2"/><path d="M3 10h20"/><path d="M8 3v4M18 3v4"/>',
    clock:'<circle cx="13" cy="13" r="10"/><path d="M13 7v6l4 3"/>',
    weather:'<circle cx="11" cy="9" r="4"/><path d="M11 3v1M11 15v1M5 9H4M18 9h-1"/>',
    files:'<path d="M4 4h7l2 2h9a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>',
    recorder:'<rect x="4" y="4" width="18" height="18" rx="4"/><circle cx="13" cy="13" r="5"/>',
    health:'<path d="M13 22C13 22 5 17 5 11a5 5 0 0110 0 5 5 0 0110 0c0 6-8 11-8 11h-4z"/>',
    settings:'<circle cx="13" cy="13" r="4"/><path d="M13 3v3M13 20v3M3 13h3M20 13h3M5.6 5.6l2.1 2.1M18.3 18.3l2.1 2.1M5.6 20.4l2.1-2.1M18.3 7.7l2.1-2.1"/>',
    social:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M4 20c0-3 2-5 5-5 1.5 0 2.8.5 3.5 1.5.7-1 2-1.5 3.5-1.5 3 0 5 2 5 5"/>',
    game:'<rect x="3" y="8" width="20" height="13" rx="3"/><circle cx="9" cy="14" r="2"/><path d="M9 13v2M8 14h2"/>',
    book:'<path d="M4 4h8a4 4 0 014 4v14s-2-3-6-3H4V4z"/><path d="M22 4h-6a4 4 0 00-4 4v14s2-3 6-3h4V4z"/>',
    food:'<circle cx="13" cy="14" r="8"/><path d="M9 11c1-2 3-3 4-3s3 1 4 3"/><path d="M7 14h12"/>',
    fitness:'<path d="M5 13h3v-3h2v3h6v-3h2v3h3"/><path d="M5 13v3h3v-3M18 13v3h3v-3"/>'
};

const PHONE_ICON_CLASS_MAP = {
    msg:'pi-msg',phone:'pi-phone',contacts:'pi-contacts',browser:'pi-browser',
    photos:'pi-photos',camera:'pi-camera',music:'pi-music',video:'pi-video',
    notes:'pi-notes',wallet:'pi-wallet',shop:'pi-shop',maps:'pi-maps',
    travel:'pi-travel',calendar:'pi-calendar',clock:'pi-clock',weather:'pi-weather',
    files:'pi-files',recorder:'pi-recorder',health:'pi-health',settings:'pi-settings',
    social:'pi-contacts',game:'pi-travel',book:'pi-notes',food:'pi-shop',fitness:'pi-health'
};

// ========== PHONE ENGINE ==========

// 統一上下文構建
function buildPhoneRoleContext(charId, currentAppId) {
    const ch = state.characters.find(c => c.id === charId);
    if (!ch) return '';
    let ctx = '';

    // 角色人設
    ctx += `【Character】\nName: ${ch.name}\n`;
    if (ch.notes) ctx += `Background: ${ch.notes}\n`;
    if (ch.systemPrompt) ctx += `Personality:\n${ch.systemPrompt}\n`;

    // 世界書
    const books = getActiveWorldBooks(ch, state.worldbooks);
    if (books.length) {
        ctx += '\n【World Setting】\n';
        books.forEach(wb => {
            ctx += `· ${wb.name}`;
            if (wb.content) ctx += `: ${wb.content}`;
            ctx += '\n';
        });
    }

    // 長期記憶
    const ltm = getCharMemoriesByType(charId, 'ltm');
    if (ltm.length) {
        ctx += '\n【Long-term Memories】\n';
        ltm.slice(0, 5).forEach(m => { ctx += `- (${m.date}) ${m.content}\n`; });
    }

    // 短期記憶
    const stm = getCharMemoriesByType(charId, 'stm').filter(m => !m.consolidated);
    if (stm.length) {
        ctx += '\n【Recent Memories】\n';
        stm.slice(0, 5).forEach(m => { ctx += `- (${m.date}) ${m.content}\n`; });
    }

    // 近期聊天
    const msgs = (state.chats[charId] || []).slice(-20);
    if (msgs.length) {
        ctx += '\n【Recent Chat】\n';
        msgs.forEach(m => {
            const who = m.role === 'user' ? 'User' : ch.name;
            let content = m.content || '';
            if (m.type === 'voice') content = '[Voice] ' + content;
            else if (m.type === 'sticker') content = '[Sticker]';
            else if (m.type === 'transfer') content = '[Transfer]';
            else if (m.type === 'image' || m.type === 'simImage') content = '[Image]';
            ctx += `${who}: ${content.slice(0, 100)}\n`;
        });
    }

    // 其他 App 已有數據快照
    const charData = getPhoneData(charId);
    const otherApps = Object.keys(charData).filter(k => k !== currentAppId);
    if (otherApps.length) {
        ctx += '\n【Other App Data Snapshot】\n';
        otherApps.forEach(appId => {
            const d = charData[appId];
            if (!d) return;
            ctx += `[${appId}]: ${JSON.stringify(d).slice(0, 300)}\n`;
        });
    }

    // 當前時間
    const now = new Date();
    ctx += `\n【Current Time】${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}\n`;

    return ctx;
}

// 全局生成規則
const PHONE_GLOBAL_RULES = `
Global rules for ALL phone apps:
1. Content MUST match this character's personality and setting.
2. Reference long-term memories and recent chats.
3. User and the character are DIFFERENT people.
4. You may create reasonable daily details.
5. Do NOT create major dramatic events without basis.
6. Events already established in memories/chats must be respected.
7. Times should not exceed the current time.
8. Different apps should be consistent with each other.
9. Return ONLY valid JSON. No explanation, no markdown.
`;

// 獲取/保存角色手機數據
function getPhoneData(charId) {
    if (!state.phoneData) state.phoneData = {};
    if (!state.phoneData[charId]) state.phoneData[charId] = {};
    return state.phoneData[charId];
}

function setPhoneAppData(charId, appId, data) {
    if (!state.phoneData) state.phoneData = {};
    if (!state.phoneData[charId]) state.phoneData[charId] = {};
    state.phoneData[charId][appId] = data;
    saveState();
}

// 單 App 生成
async function generateSingleApp(charId, appId) {
    const appDef = PHONE_APPS[appId];
    if (!appDef) return null;

    const api = state.apis.find(a => a.id === state.activeApiId);
    if (!api?.url || !api.model) { showErrorModal(T('configApi')); return null; }

    const ctx = buildPhoneRoleContext(charId, appId);
    const prompt = ctx + '\n' + PHONE_GLOBAL_RULES + '\n' + appDef.prompt;

    try {
        const reply = await sendChat(api, [
            { role: 'system', content: prompt },
            { role: 'user', content: `Generate ${appDef.name.en || appDef.name} data for this character. Return ONLY JSON.` }
        ]);
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            setPhoneAppData(charId, appId, data);
            return data;
        }
    } catch (e) {
        showErrorModal(friendlyError(e));
    }
    return null;
}

// 整機生成（一次 API 調用）
async function generateAllApps(charId) {
    const api = state.apis.find(a => a.id === state.activeApiId);
    if (!api?.url || !api.model) { showErrorModal(T('configApi')); return false; }

    const appIds = Object.keys(PHONE_APPS);
    const ctx = buildPhoneRoleContext(charId, null);

    let appPrompts = '';
    appIds.forEach(id => {
        const app = PHONE_APPS[id];
        appPrompts += `\n--- ${id} ---\n${app.prompt}\n`;
    });

    const prompt = ctx + '\n' + PHONE_GLOBAL_RULES + `

IMPORTANT: First, internally construct a unified daily timeline for this character (what they did today, where, when, with whom). Then generate data for ALL apps based on that same timeline to ensure cross-app consistency.

Generate data for these apps: ${appIds.join(', ')}

Return ONE JSON object with each app as a key:
{
${appIds.map(id => `    "${id}": { ... }`).join(',\n')}
}

Individual app schemas:
${appPrompts}`;

    try {
        const reply = await sendChat(api, [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Generate all phone apps now. Return ONLY the combined JSON.' }
        ]);
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const allData = JSON.parse(jsonMatch[0]);
            appIds.forEach(id => {
                if (allData[id]) setPhoneAppData(charId, id, allData[id]);
            });
            return true;
        }
    } catch (e) {
        showErrorModal(friendlyError(e));
    }
    return false;
}

// App 名稱本地化
function getAppName(appDef) {
    if (typeof appDef.name === 'object') return appDef.name[state.lang] || appDef.name.en;
    return appDef.name;
}

			// ========== PHONE UI ==========

function enterPhoneScreen() {
    nav('screen-phone');
    if (phoneState.selectedCharId && state.characters.find(c => c.id === phoneState.selectedCharId)) {
        showPhoneFrame();
    } else {
        showPhoneCharSelect();
    }
}

function showPhoneCharSelect() {
    document.getElementById('phoneCharSelect').style.display = 'block';
    document.getElementById('phoneFrameWrap').style.display = 'none';
    document.getElementById('phoneNavRight').style.display = 'none';
    document.getElementById('phoneNavTitle').textContent = T('phone');
    phoneState.currentAppId = null;
    renderPhoneCharList();
}

function renderPhoneCharList() {
    const el = document.getElementById('phoneCharList');
    if (!state.characters.length) {
        el.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,.35);padding:30px;font-size:14px">${T('noCharForPhone')}</div>`;
        return;
    }
    el.innerHTML = '<div style="background:rgba(255,255,255,.04);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.06)">' +
        state.characters.map(ch =>
            `<div style="display:flex;align-items:center;padding:16px;gap:14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05)" onclick="selectPhoneChar('${ch.id}')">
                <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.06);overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    ${ch.avatar ? `<img src="${ch.avatar}" style="width:100%;height:100%;object-fit:cover">` : '<svg viewBox="0 0 32 32" style="width:24px;height:24px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:1.5"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>'}
                </div>
                <div style="flex:1"><div style="color:#fff;font-size:16px;font-weight:600">${esc(ch.name)}</div><div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:3px">${T('tapToViewPhone')}</div></div>
                <svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:2"><path d="M6 3l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>`
        ).join('') + '</div>';
}

async function selectPhoneChar(cid) {
    phoneState.selectedCharId = cid;
    showPhoneFrame();
    renderPhoneHome();

    const charData = getPhoneData(cid);
    if (Object.keys(charData).length === 0) {
        // 首次：整機生成
        const grid = document.getElementById('phoneAppGrid');
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px 0"><div class="spin-ring" style="width:28px;height:28px;border-color:rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6)"></div><div style="color:rgba(255,255,255,.35);font-size:13px;margin-top:14px">${T('generatingPhone')}</div></div>`;
        await generateAllApps(cid);
        renderPhoneHome();
    }
}

function showPhoneFrame() {
    document.getElementById('phoneCharSelect').style.display = 'none';
    document.getElementById('phoneFrameWrap').style.display = 'block';
    document.getElementById('phoneNavRight').style.display = 'flex';
    const ch = state.characters.find(c => c.id === phoneState.selectedCharId);
    if (ch) {
        document.getElementById('phoneNavTitle').textContent = ch.name;
        document.getElementById('phoneOwnerName').textContent = ch.name + "'s Phone";
    }
    updatePhoneTime();
}

function renderPhoneHome() {
    const cid = phoneState.selectedCharId;
    const grid = document.getElementById('phoneAppGrid');

    // 渲染註冊的 App 圖標
    const appIds = Object.keys(PHONE_APPS);
    const charData = getPhoneData(cid);

    grid.innerHTML = appIds.map(appId => {
        const app = PHONE_APPS[appId];
        const iconKey = app.icon || 'notes';
        const iconClass = app.iconClass || PHONE_ICON_CLASS_MAP[iconKey] || 'pi-notes';
        const svgInner = PHONE_ICON_SVG[iconKey] || PHONE_ICON_SVG.notes;
        const data = charData[appId];
        const badge = data ? (app.getCount(data) || 0) : 0;
        const name = getAppName(app);
        return `<div class="phone-app-item" onclick="openPhoneApp('${appId}')" style="cursor:pointer">
            <div class="phone-app-icon ${iconClass}">
                <svg viewBox="0 0 26 26">${svgInner}</svg>
                ${badge > 0 ? `<div class="phone-app-badge">${badge > 99 ? '99+' : badge}</div>` : ''}
            </div>
            <div class="phone-app-name">${esc(name.slice(0, 12))}</div>
        </div>`;
    }).join('');
}

// 進入 App 內容頁
function openPhoneApp(appId) {
    const appDef = PHONE_APPS[appId];
    if (!appDef) return;

    phoneState.currentAppId = appId;
    const cid = phoneState.selectedCharId;
    const data = getPhoneData(cid)[appId];
    const frame = document.querySelector('.phone-frame');
    const name = getAppName(appDef);

    // 隱藏首頁內容，顯示 App 頁
    frame.innerHTML = `
        <div style="background:linear-gradient(165deg,#1a1a1e,#2c2c30);min-height:100%">
            <div style="display:flex;align-items:center;padding:14px 12px;gap:10px;position:sticky;top:0;background:rgba(26,26,30,.95);backdrop-filter:blur(10px);z-index:10">
                <button onclick="backToPhoneHome()" style="background:none;border:none;cursor:pointer;padding:4px"><svg viewBox="0 0 20 20" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2"><path d="M12 4l-6 6 6 6" stroke-linecap="round"/></svg></button>
                <span style="flex:1;color:#fff;font-size:17px;font-weight:600">${esc(name)}</span>
                <button onclick="refreshPhoneApp('${appId}')" style="background:none;border:none;cursor:pointer;padding:4px" id="phoneAppRefreshBtn"><svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:1.5"><path d="M14.5 3.5l1 3.5h-3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 16.5l-1-3.5h3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7a7 7 0 01-1 9.5M5 13a7 7 0 011-9.5" stroke-linecap="round"/></svg></button>
            </div>
            <div id="phoneAppContent">${data ? appDef.renderList(data, '') : '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No data yet. Tap refresh.</div>'}</div>
        </div>`;
}

// 進入詳情頁
function openPhoneAppDetail(appId, index) {
    const appDef = PHONE_APPS[appId];
    if (!appDef) return;

    const cid = phoneState.selectedCharId;
    const data = getPhoneData(cid)[appId];
    const name = getAppName(appDef);
    const frame = document.querySelector('.phone-frame');

    frame.innerHTML = `
        <div style="background:linear-gradient(165deg,#1a1a1e,#2c2c30);min-height:100%">
            <div style="display:flex;align-items:center;padding:14px 12px;gap:10px;position:sticky;top:0;background:rgba(26,26,30,.95);backdrop-filter:blur(10px);z-index:10">
                <button onclick="openPhoneApp('${appId}')" style="background:none;border:none;cursor:pointer;padding:4px"><svg viewBox="0 0 20 20" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2"><path d="M12 4l-6 6 6 6" stroke-linecap="round"/></svg></button>
                <span style="flex:1;color:#fff;font-size:17px;font-weight:600">${esc(name)}</span>
            </div>
            <div>${data ? appDef.renderDetail(data, index) : ''}</div>
        </div>`;
}

// 返回手機首頁
function backToPhoneHome() {
    phoneState.currentAppId = null;
    // 重建首頁
    const frame = document.querySelector('.phone-frame');
    frame.innerHTML = buildPhoneFrameHTML();
    renderPhoneHome();
    updatePhoneTime();
}

function buildPhoneFrameHTML() {
    return `<div class="phone-statusbar"><div class="phone-statusbar-left"><svg viewBox="0 0 14 14"><path d="M1 10l3-6h6l3 6"/><path d="M3 10h8"/></svg><span>LTE</span></div><div class="phone-statusbar-right"><svg viewBox="0 0 14 14"><path d="M1 4h2v8H1zM5 2h2v10H5zM9 5h2v7H9zM13 7h0"/></svg><svg viewBox="0 0 14 14"><rect x="1" y="4" width="10" height="7" rx="1"/><path d="M12 6.5v2"/></svg><span>85%</span></div></div>
    <div class="phone-time-display"><div class="ptd-time" id="phoneTime">09:41</div><div class="ptd-date" id="phoneDate">Monday, January 1</div></div>
    <div style="text-align:center;padding:0 0 20px"><span style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,.06);border-radius:20px;color:rgba(255,255,255,.4);font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.06)" id="phoneOwnerName"></span></div>
    <div class="phone-app-grid" id="phoneAppGrid"></div>
    <div class="phone-dock"><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4c0 0-2 3-2 5s3 6 6 9 7 5 9 5 5-2 5-2l-3-4-3 2c-1 0-4-2-6-4s-4-5-4-6l2-3L6 4z"/></svg></div><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h18a1 1 0 011 1v11a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg></div><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="13" r="10"/><path d="M3 13h20"/><path d="M13 3c-3 3-4 6-4 10s1 7 4 10"/><path d="M13 3c3 3 4 6 4 10s-1 7-4 10"/></svg></div><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20V6l12-3v14"/><circle cx="7" cy="20" r="3"/><circle cx="19" cy="17" r="3"/></svg></div></div>
    <div class="phone-home-bar"></div>`;
}

// 單 App 刷新
async function refreshPhoneApp(appId) {
    const btn = document.getElementById('phoneAppRefreshBtn');
    if (btn) btn.innerHTML = '<div class="spin-ring sm" style="border-color:rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6)"></div>';

    const data = await generateSingleApp(phoneState.selectedCharId, appId);
    if (data) {
        const appDef = PHONE_APPS[appId];
        const el = document.getElementById('phoneAppContent');
        if (el && appDef) el.innerHTML = appDef.renderList(data, '');
    }

    if (btn) btn.innerHTML = '<svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:1.5"><path d="M14.5 3.5l1 3.5h-3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 16.5l-1-3.5h3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7a7 7 0 01-1 9.5M5 13a7 7 0 011-9.5" stroke-linecap="round"/></svg>';
    showToast(T('regenerated'));
}

// 整機刷新
async function regeneratePhone() {
    if (!phoneState.selectedCharId) return;
    const grid = document.getElementById('phoneAppGrid');
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px 0"><div class="spin-ring" style="width:28px;height:28px;border-color:rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6)"></div><div style="color:rgba(255,255,255,.35);font-size:13px;margin-top:14px">${T('generatingPhone')}</div></div>`;
    await generateAllApps(phoneState.selectedCharId);
    renderPhoneHome();
    showToast(T('regenerated'));
}

// ========== MEMORY ==========
const MEMORY_MOODS = ['calm','happy','excited','sad','nostalgic','grateful'];
let memFilterCharId = 'all'; // 'all' 或角色ID

function fmtMemDate(dateStr){
  if(!dateStr)return'—';
  const d=new Date(dateStr+'T00:00:00');
  if(isNaN(d))return dateStr;
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
}

// 渲染角色切換條
function renderMemCharFilter(){
  const el=document.getElementById('memCharFilter');
  const chars=state.characters||[];
  
  let h=`<div class="mem-char-chip${memFilterCharId==='all'?' active':''}" onclick="setMemCharFilter('all')">
    <span>${T('allMessages')}</span>
  </div>`;
  
  chars.forEach(ch=>{
    const count=getCharMemories(ch.id).length;
    if(count>0 || memFilterCharId===ch.id){
      h+=`<div class="mem-char-chip${memFilterCharId===ch.id?' active':''}" onclick="setMemCharFilter('${ch.id}')">
        <div class="mcc-avatar">${ch.avatar?`<img src="${ch.avatar}">`:'<svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>'}</div>
        <span>${esc(ch.name)}</span>
      </div>`;
    }
  });
  
  // 沒有記憶的角色也顯示，但放在後面
  chars.forEach(ch=>{
    const count=getCharMemories(ch.id).length;
    if(count===0 && memFilterCharId!==ch.id){
      h+=`<div class="mem-char-chip${memFilterCharId===ch.id?' active':''}" onclick="setMemCharFilter('${ch.id}')">
        <div class="mcc-avatar">${ch.avatar?`<img src="${ch.avatar}">`:'<svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>'}</div>
        <span>${esc(ch.name)}</span>
      </div>`;
    }
  });
  
  el.innerHTML=h;
}

// 渲染選中角色的信息卡
function renderMemCharInfo(){
  const el=document.getElementById('memCharInfoArea');
  if(memFilterCharId==='all'){el.innerHTML='';return}
  
  const ch=state.characters.find(c=>c.id===memFilterCharId);
  if(!ch){el.innerHTML='';return}
  
  const mems=getCharMemories(ch.id);
  const msgCount=(state.chats[ch.id]||[]).length;
  
  el.innerHTML=`<div class="mem-char-info-card">
    <div class="mcic-avatar">${ch.avatar?`<img src="${ch.avatar}">`:'<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M5 22c0-4 3-7 7-7s7 3 7 7"/></svg>'}</div>
    <div class="mcic-info">
      <div class="mcic-name">${esc(ch.name)}</div>
      <div class="mcic-stats">${mems.length} ${T('totalMemories')} · ${msgCount} ${T('msgCount')}</div>
    </div>
  </div>`;
}

function setMemCharFilter(id){
  memFilterCharId=id;
  renderMemCharFilter();
  renderMemCharInfo();
  renderMemoryList();
}

// 獲取當前篩選的記憶
function getFilteredMemories(){
  const mems=state.memories||[];
  if(memFilterCharId==='all')return mems;
  return mems.filter(m=>m.charId===memFilterCharId);
}

function renderMemoryList(){
  // 先渲染角色篩選條
  renderMemCharFilter();
  renderMemCharInfo();
  
  const body=document.getElementById('memoryListBody');
  const filtered=getFilteredMemories();
  const allMems=memFilterCharId==='all'?(state.memories||[]):filtered;

  // stats - 根據篩選顯示
  document.getElementById('memStatTotal').textContent=filtered.length;
  if(filtered.length){
    const sorted=[...filtered].sort((a,b)=>new Date(a.date)-new Date(b.date));
    document.getElementById('memStatFirst').textContent=fmtMemDate(sorted[0].date);
    const now=new Date();
    const thisMonth=filtered.filter(m=>{const d=new Date(m.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()}).length;
    document.getElementById('memStatStreak').textContent=thisMonth;
  }else{
    document.getElementById('memStatFirst').textContent='—';
    document.getElementById('memStatStreak').textContent='0';
  }

  if(!filtered.length){
    const isFiltered=memFilterCharId!=='all';
    const ch=isFiltered?state.characters.find(c=>c.id===memFilterCharId):null;
    body.innerHTML=`<div class="mem-empty">
      <svg viewBox="0 0 48 48" style="width:44px;height:44px;stroke:#d1d1d6;fill:none;stroke-width:1">
        <rect x="8" y="5" width="32" height="38" rx="5"/>
        <rect x="13" y="9" width="22" height="16" rx="2"/>
        <path d="M17 32h14"/><path d="M20 36h8"/>
      </svg>
      <p>${isFiltered?(T('noCharMemories')):(T('noMemories'))}<br>
      <span style="font-size:12px">${isFiltered?esc(ch?.name||'')+'':T('noMemoriesSub')}</span></p>
    </div>`;
    return;
  }

  const sorted=[...filtered].sort((a,b)=>new Date(b.date)-new Date(a.date));
  let h='<div class="mem-timeline">';
  sorted.forEach(mem=>{
    const moodKey=mem.mood?('mood'+mem.mood.charAt(0).toUpperCase()+mem.mood.slice(1)):'';
    // 找到關聯的角色
    const memChar=mem.charId?state.characters.find(c=>c.id===mem.charId):null;
    
    h+=`<div class="mem-tl-item"><div class="mem-tl-card" onclick="editMemory('${mem.id}')">`;
    if(mem.photo)h+=`<div class="mem-tl-photo"><img src="${mem.photo}"></div>`;
    h+=`<div class="mem-tl-body"><div class="mem-tl-title">${esc(mem.title||'Untitled')}</div>`;
    if(mem.content)h+=`<div class="mem-tl-text">${esc(mem.content)}</div>`;
    h+=`<div class="mem-tl-footer"><span class="mem-tl-date">${fmtMemDate(mem.date)}</span>`;
    if(mem.mood)h+=`<span class="mem-tl-mood">${esc(moodKey?T(moodKey):mem.mood)}</span>`;
// 記憶類型標籤
if(mem.memType==='stm')h+=`<span class="mem-type-stm">${T('stmLabel')}</span>`;
else if(mem.memType==='ltm')h+=`<span class="mem-type-ltm">${T('ltmLabel')}</span>`;
else if(mem.autoGenerated)h+=`<span class="mem-tl-mood" style="background:#e8e8ed;color:#8e8e93">Auto</span>`;
// 已合併標記
if(mem.consolidated)h+=`<span class="mem-tl-mood" style="background:#f0f0f5;color:#aeaeb2;text-decoration:line-through">merged</span>`;
// 全部模式下顯示角色名
if(memFilterCharId==='all'&&memChar)h+=`<span class="mem-tl-mood" style="background:#eef2ee;color:#48784a">${esc(memChar.name)}</span>`;
    h+=`</div></div></div></div>`;
  });
  h+='</div>';

  // 收藏部分
  h+=`<div style="padding:24px 20px 8px;font-size:13px;color:#8e8e93;text-transform:uppercase;letter-spacing:.5px;font-weight:600;display:flex;align-items:center;gap:8px">
    <svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:#8e8e93;fill:none;stroke-width:1.5"><path d="M3 1h10a1 1 0 011 1v13l-6-3-6 3V2a1 1 0 011-1z"/></svg>
    <span>${T('bookmarkedMessages')}</span>
  </div>`;

  const bks=(state.bookmarks||[]).filter(b=>{
    if(memFilterCharId==='all')return true;
    return b.charId===memFilterCharId;
  }).sort((a,b)=>b.bookmarkedAt-a.bookmarkedAt);

  if(!bks.length){
    h+=`<div style="text-align:center;padding:20px 30px;color:#c7c7cc;font-size:13px">${T('noBookmarksInMemory')}</div>`;
  }else{
    h+='<div style="margin:0 16px 16px">';
    bks.forEach(b=>{
      const bChar=b.charId?state.characters.find(c=>c.id===b.charId):null;
      const senderName=b.role==='user'?(state.userProfile.name||'User'):(b.charName||'');
      const avatarHtml=b.role==='user'?
        (state.userProfile.avatar?`<img src="${state.userProfile.avatar}" style="width:100%;height:100%;object-fit:cover">`:''):
        (b.charAvatar?`<img src="${b.charAvatar}" style="width:100%;height:100%;object-fit:cover">`:PERSON_SVG);

      h+=`<div style="background:#fff;border-radius:14px;padding:14px 16px;margin-bottom:8px;border:1px solid #ececec;box-shadow:0 1px 4px rgba(0,0,0,.04);display:flex;gap:12px;align-items:flex-start">
        <div style="width:36px;height:36px;border-radius:50%;background:#e5e5ea;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center">${avatarHtml}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:13px;font-weight:600;color:#1d1d1f">${esc(senderName)}</span>
            ${memFilterCharId==='all'&&bChar?`<span style="font-size:10px;padding:1px 6px;background:#eef2ee;color:#48784a;border-radius:3px">${esc(bChar.name)}</span>`:''}
            <span style="font-size:10px;color:#c7c7cc;margin-left:auto">${fmtTime(b.timestamp)}</span>
          </div>
          <div style="font-size:13px;color:#3a3a3c;line-height:1.4;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">${esc((b.content||'').slice(0,200))}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
            <svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#c7c7cc;fill:none;stroke-width:1.5"><path d="M3 1h8a1 1 0 011 1v11l-5-2.5L2 13V2a1 1 0 011-1z"/></svg>
            <span style="font-size:10px;color:#c7c7cc">${fmtMemDate(new Date(b.bookmarkedAt).toISOString().split('T')[0])}</span>
          </div>
        </div>
        <button onclick="event.stopPropagation();removeBookmarkFromMemory('${b.id}')" style="background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;margin-top:2px">
          <svg viewBox="0 0 14 14" style="width:14px;height:14px;stroke:#ff3b30;fill:none;stroke-width:1.5"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg>
        </button>
      </div>`;
    });
    h+='</div>';
  }

  body.innerHTML=h;
}

function removeBookmarkFromMemory(bid){
  state.bookmarks=(state.bookmarks||[]).filter(b=>b.id!==bid);
  saveState();
  renderMemoryList();
  showToast(T('unbookmarked'));
}


function editMemory(id){
  state.editingMemId=id;
  tmp.memEditFrom=document.querySelector('.screen.active')?.id||'screen-memory';
  const m=id?(state.memories||[]).find(x=>x.id===id):null;
  
  document.getElementById('memEditTitle').textContent=m?T('editMemory'):T('addMemory');
  document.getElementById('memTitle').value=m?(m.title||''):'';
  document.getElementById('memDate').value=m?m.date:new Date().toISOString().split('T')[0];
  document.getElementById('memContent').value=m?(m.content||''):'';
  document.getElementById('deleteMemBtn').style.display=m?'block':'none';
  tmp.memPhoto=m?m.photo:null;
  tmp.memMood=m?(m.mood||''):'';

  const pv=document.getElementById('memPhotoPv'),ph=document.getElementById('memPhotoPh');
  if(tmp.memPhoto){pv.src=tmp.memPhoto;pv.style.display='block';ph.style.display='none'}
  else{pv.style.display='none';ph.style.display='flex'}

  // 渲染角色選擇器
  renderMemCharSelect(m?.charId||'');
  
  document.getElementById('memMoodGrid').innerHTML=renderMemMoods(tmp.memMood);
  nav('screen-memory-edit');
}

// 角色選擇下拉
function renderMemCharSelect(selectedCharId){
  const sel=document.getElementById('memCharSelect');
  let h='<option value="">— '+T('allMessages')+' —</option>';
  state.characters.forEach(ch=>{
    h+=`<option value="${ch.id}"${ch.id===selectedCharId?' selected':''}>${esc(ch.name)}</option>`;
  });
  sel.innerHTML=h;
}

function renderMemMoods(sel){
  return MEMORY_MOODS.map(m=>{
    const key='mood'+m.charAt(0).toUpperCase()+m.slice(1);
    return`<div class="mem-mood-tag${sel===m?' selected':''}" onclick="selectMemMood(this,'${m}')">${T(key)}</div>`;
  }).join('');
}

function selectMemMood(el,mood){
  if(tmp.memMood===mood){tmp.memMood='';el.classList.remove('selected')}
  else{document.querySelectorAll('#memMoodGrid .mem-mood-tag').forEach(t=>t.classList.remove('selected'));tmp.memMood=mood;el.classList.add('selected')}
}

function previewMemPhoto(inp){
  if(inp.files?.[0]){
    const r=new FileReader();
    r.onload=e=>{
      tmp.memPhoto=e.target.result;
      document.getElementById('memPhotoPv').src=e.target.result;
      document.getElementById('memPhotoPv').style.display='block';
      document.getElementById('memPhotoPh').style.display='none';
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function saveMemory(){
  const title=document.getElementById('memTitle').value.trim();
  const date=document.getElementById('memDate').value;
  const content=document.getElementById('memContent').value.trim();
  const charId=document.getElementById('memCharSelect').value||null;
  if(!title){showToast(T('enterName'));return}
  if(!state.memories)state.memories=[];

  if(state.editingMemId){
    const m=state.memories.find(x=>x.id===state.editingMemId);
    if(m)Object.assign(m,{title,date,content,mood:tmp.memMood,photo:tmp.memPhoto,charId:charId});
  }else{
    state.memories.push({
      id:uid(),
      title,
      date,
      content,
      mood:tmp.memMood,
      photo:tmp.memPhoto,
      charId:charId,
      timestamp:Date.now()
    });
  }
  saveState();showToast(T('memorySaved'));
  nav(tmp.memEditFrom||'screen-memory');
}

function deleteMemory(){
  if(!state.editingMemId)return;
  const bk=JSON.parse(JSON.stringify(state.memories.find(x=>x.id===state.editingMemId)));
  state.memories=state.memories.filter(x=>x.id!==state.editingMemId);
  saveState();
  nav(tmp.memEditFrom||'screen-memory');
  showSnackbar(T('memoryDeleted'),()=>{state.memories.push(bk);saveState();renderMemoryList()});
}

// ========== CHAT MENU ==========
function toggleChatMenu(){
    const m=document.getElementById('chatMenu');
    const o=document.getElementById('chatMenuOverlay');
    const isOpen=m.classList.contains('open');
    if(isOpen){m.classList.remove('open');o.classList.remove('show')}
    else{m.classList.add('open');o.classList.add('show')}
}
function closeChatMenu(){
    document.getElementById('chatMenu')?.classList.remove('open');
    document.getElementById('chatMenuOverlay')?.classList.remove('show');
}

// ========== CHAR CONFIG ==========
function getCharConfig(cid){
    if(!state.charConfig)state.charConfig={};
    if(!state.charConfig[cid])state.charConfig[cid]={
        autoMemory:false,
        memoryInterval:20,
        contextCount:50,
        consolidateInterval:5,
        lastSummaryMsgCount:0,
        lastConsolidateCount:0
    };
    // 兼容舊數據
    const cfg=state.charConfig[cid];
    if(cfg.consolidateInterval===undefined)cfg.consolidateInterval=5;
    if(cfg.lastConsolidateCount===undefined)cfg.lastConsolidateCount=0;
    return cfg;
}
function saveCharConfig(){saveState()}

let cfgMemTypeFilter='all'; // 'all','stm','ltm'

function openChatConfig(){
    if(!state.currentCharId)return;
    const cfg=getCharConfig(state.currentCharId);

    document.getElementById('cfgAutoMemToggle').classList.toggle('on',!!cfg.autoMemory);
    document.getElementById('cfgMemInterval').value=cfg.memoryInterval||20;
    document.getElementById('cfgMemIntervalVal').textContent=cfg.memoryInterval||20;
    document.getElementById('cfgContextCount').value=cfg.contextCount||50;
    document.getElementById('cfgContextCountVal').textContent=cfg.contextCount||50;
    document.getElementById('cfgConsolidateInterval').value=cfg.consolidateInterval||5;
    document.getElementById('cfgConsolidateIntervalVal').textContent=cfg.consolidateInterval||5;

    cfgMemTypeFilter='all';
    document.querySelectorAll('#cfgMemTypeTabs .cfg-mem-type-tab').forEach(t=>t.classList.toggle('active',t.dataset.memtype==='all'));
    renderCfgCharMemories();
}

function toggleCfgAutoMem(){
    const cfg=getCharConfig(state.currentCharId);
    cfg.autoMemory=!cfg.autoMemory;
    document.getElementById('cfgAutoMemToggle').classList.toggle('on',cfg.autoMemory);
    saveCharConfig();
}

function updateCfgMemInterval(v){
    const cfg=getCharConfig(state.currentCharId);
    cfg.memoryInterval=parseInt(v)||20;
    document.getElementById('cfgMemIntervalVal').textContent=v;
    saveCharConfig();
}

function updateCfgContextCount(v){
    const cfg=getCharConfig(state.currentCharId);
    cfg.contextCount=parseInt(v)||50;
    document.getElementById('cfgContextCountVal').textContent=v;
    saveCharConfig();
}

function updateCfgConsolidateInterval(v){
    const cfg=getCharConfig(state.currentCharId);
    cfg.consolidateInterval=parseInt(v)||5;
    document.getElementById('cfgConsolidateIntervalVal').textContent=v;
    saveCharConfig();
}

function setCfgMemTypeFilter(type,el){
    cfgMemTypeFilter=type;
    document.querySelectorAll('#cfgMemTypeTabs .cfg-mem-type-tab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    renderCfgCharMemories();
}

// ========== CHARACTER MEMORIES ==========
function getCharMemories(cid){
    return(state.memories||[]).filter(m=>m.charId===cid).sort((a,b)=>new Date(b.date)-new Date(a.date));
}

function getCharMemoriesByType(cid,type){
    const all=getCharMemories(cid);
    if(type==='all')return all;
    if(type==='stm')return all.filter(m=>m.memType==='stm');
    if(type==='ltm')return all.filter(m=>m.memType==='ltm');
    return all;
}

function renderCfgCharMemories(){
    const el=document.getElementById('cfgCharMemList');
    const mems=getCharMemoriesByType(state.currentCharId,cfgMemTypeFilter);

    if(!mems.length){
        el.innerHTML=`<div style="text-align:center;padding:24px;color:#8e8e93;font-size:14px">${T('noCharMemories')}</div>`;
        return;
    }

    el.innerHTML='<div class="config-mem-list">'+mems.map(m=>{
        const typeClass=m.memType==='ltm'?'mem-type-ltm':(m.memType==='stm'?'mem-type-stm':'mem-type-manual');
        const typeLabel=m.memType==='ltm'?T('ltmLabel'):(m.memType==='stm'?T('stmLabel'):'Manual');
        return`<div class="config-mem-item" onclick="editMemory('${m.id}')">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div class="cmi-title" style="flex:1">${esc(m.title||'Untitled')}</div>
                <span class="${typeClass}">${typeLabel}</span>
            </div>
            <div class="cmi-text">${esc(m.content||'')}</div>
            <div class="cmi-date">${fmtMemDate(m.date)}</div>
        </div>`;
    }).join('')+'</div>';
}

// ========== MANUAL SUMMARIZE → 短期記憶 ==========
async function manualSummarize(){
    if(!state.currentCharId)return;
    const api=state.apis.find(a=>a.id===state.activeApiId);
    if(!api?.url||!api.model){showErrorModal(T('configApi'));return}

    const ch=state.characters.find(c=>c.id===state.currentCharId);
    if(!ch)return;

    const msgs=state.chats[state.currentCharId]||[];
    if(msgs.length<4){showToast('Not enough messages');return}

    const cfg=getCharConfig(state.currentCharId);
    const interval=cfg.memoryInterval||20;
    const recentMsgs=msgs.slice(-interval);

    const btn=document.getElementById('manualSumBtn');
    const txt=document.getElementById('manualSumBtnText');
    txt.textContent=T('summarizing');
    btn.disabled=true;
    const sp=document.createElement('span');sp.className='spin-ring sm';sp.style.marginLeft='8px';btn.appendChild(sp);

    try{
        const summary=await callSummarize(ch,recentMsgs,api);
        saveMemoryEntry(ch.id,'stm',T('summaryOf')+' '+ch.name,summary);
        cfg.lastSummaryMsgCount=msgs.length;
        saveCharConfig();
        renderCfgCharMemories();
        showToast(T('summarized'));
        // 檢查是否需要自動合併
        checkAutoConsolidate(ch.id);
    }catch(e){
        showErrorModal(friendlyError(e));
    }finally{
        txt.textContent=T('manualSummarize');
        btn.disabled=false;
        sp.remove();
    }
}

async function callSummarize(ch,msgs,api){
    const formatted=msgs.map(m=>{
        const who=m.role==='user'?'User':ch.name;
        let content=m.content||'';
        if(m.type==='voice')content='[Voice] '+content;
        else if(m.type==='sticker')content='[Sticker]';
        else if(m.type==='transfer')content='[Transfer]';
        else if(m.type==='image')content='[Image]';
        else if(m.type==='simImage')content='[Image: '+content+']';
        return who+': '+content;
    }).join('\n');

    const prompt=`You are a memory summarizer. Summarize the following conversation between User and ${ch.name} into a concise short-term memory note.

Focus on:
- Key events and topics discussed
- Emotional moments and mood changes
- Important information revealed
- Relationship developments

Rules:
- Write in third-person narrative style
- Keep it under 150 words
- Be factual and concise
- Do not add anything not in the conversation

Conversation:
${formatted}

Write ONLY the summary, nothing else.`;

    return await sendChat(api,[
        {role:'system',content:prompt},
        {role:'user',content:'Summarize now.'}
    ]);
}

// ========== 保存記憶條目 ==========
function saveMemoryEntry(charId,memType,title,content){
    if(!state.memories)state.memories=[];
    const today=new Date().toISOString().split('T')[0];
    state.memories.push({
        id:uid(),
        title:title,
        date:today,
        content:content,
        mood:'',
        photo:null,
        charId:charId,
        memType:memType, // 'stm' | 'ltm' | null(手動)
        autoGenerated:true,
        timestamp:Date.now()
    });
    saveState();
}

// ========== MANUAL CONSOLIDATE → 長期記憶 ==========
async function manualConsolidate(){
    if(!state.currentCharId)return;
    const api=state.apis.find(a=>a.id===state.activeApiId);
    if(!api?.url||!api.model){showErrorModal(T('configApi'));return}

    const ch=state.characters.find(c=>c.id===state.currentCharId);
    if(!ch)return;

    const cfg=getCharConfig(state.currentCharId);
    const interval=cfg.consolidateInterval||5;

    // 獲取未合併的短期記憶
    const stmList=getUnconsolidatedSTM(state.currentCharId);
    if(stmList.length<2){
        showToast(T('noShortTermForConsolidate'));
        return;
    }

    // 取最多 interval 條來合併
    const toMerge=stmList.slice(0,interval);

    const btn=document.getElementById('consolidateBtn');
    const txt=document.getElementById('consolidateBtnText');
    txt.textContent=T('consolidating');
    btn.disabled=true;
    const sp=document.createElement('span');sp.className='spin-ring sm';sp.style.marginLeft='8px';btn.appendChild(sp);

    try{
        const ltmContent=await callConsolidate(ch,toMerge,api);
        saveMemoryEntry(ch.id,'ltm',T('longTermMemory')+': '+ch.name,ltmContent);

        // 標記這些短期記憶為已合併
        toMerge.forEach(m=>{m.consolidated=true});
        saveState();

        cfg.lastConsolidateCount=(cfg.lastConsolidateCount||0)+toMerge.length;
        saveCharConfig();
        renderCfgCharMemories();
        showToast(T('consolidated'));
    }catch(e){
        showErrorModal(friendlyError(e));
    }finally{
        txt.textContent=T('consolidateNow');
        btn.disabled=false;
        sp.remove();
    }
}

// 獲取未被合併過的短期記憶
function getUnconsolidatedSTM(charId){
    return(state.memories||[])
        .filter(m=>m.charId===charId && m.memType==='stm' && !m.consolidated)
        .sort((a,b)=>new Date(a.date)-new Date(b.date));
}

async function callConsolidate(ch,stmList,api){
    const formatted=stmList.map((m,i)=>{
        return`[Memory ${i+1} - ${m.date}]\n${m.content}`;
    }).join('\n\n');

    const prompt=`You are a memory consolidator. You are given ${stmList.length} short-term memory notes about conversations between User and ${ch.name}.

Your job: merge them into ONE comprehensive long-term memory summary.

Rules:
- Combine overlapping information
- Preserve the most important facts, emotional developments, and relationship changes
- Remove redundancy
- Write in third-person narrative style
- Keep it under 300 words
- Organize chronologically
- Highlight key turning points in the relationship
- Note any recurring themes or patterns

Short-term memories:
${formatted}

Write ONLY the consolidated long-term memory, nothing else.`;

    return await sendChat(api,[
        {role:'system',content:prompt},
        {role:'user',content:'Consolidate these memories now.'}
    ]);
}

// ========== AUTO SUMMARIZE CHECK ==========
async function checkAutoSummarize(){
    if(!state.currentCharId)return;
    const cfg=getCharConfig(state.currentCharId);
    if(!cfg.autoMemory)return;

    const msgs=state.chats[state.currentCharId]||[];
    const interval=cfg.memoryInterval||20;
    const lastCount=cfg.lastSummaryMsgCount||0;

    if(msgs.length-lastCount>=interval){
        const api=state.apis.find(a=>a.id===state.activeApiId);
        if(!api?.url||!api.model)return;

        const ch=state.characters.find(c=>c.id===state.currentCharId);
        if(!ch)return;

        const recentMsgs=msgs.slice(lastCount,lastCount+interval);
        try{
            const summary=await callSummarize(ch,recentMsgs,api);
            saveMemoryEntry(ch.id,'stm',T('summaryOf')+' '+ch.name,summary);
            cfg.lastSummaryMsgCount=msgs.length;
            saveCharConfig();
            showToast(T('summarized'));
            // 檢查自動合併
            checkAutoConsolidate(ch.id);
        }catch(e){
            // silent fail
        }
    }
}

// ========== AUTO CONSOLIDATE CHECK ==========
async function checkAutoConsolidate(charId){
    const cfg=getCharConfig(charId);
    const interval=cfg.consolidateInterval||5;
    const stmList=getUnconsolidatedSTM(charId);

    if(stmList.length>=interval){
        const api=state.apis.find(a=>a.id===state.activeApiId);
        if(!api?.url||!api.model)return;

        const ch=state.characters.find(c=>c.id===charId);
        if(!ch)return;

        const toMerge=stmList.slice(0,interval);
        try{
            const ltmContent=await callConsolidate(ch,toMerge,api);
            saveMemoryEntry(charId,'ltm',T('longTermMemory')+': '+ch.name,ltmContent);
            toMerge.forEach(m=>{m.consolidated=true});
            cfg.lastConsolidateCount=(cfg.lastConsolidateCount||0)+toMerge.length;
            saveState();
        }catch(e){
            // silent fail
        }
    }
}