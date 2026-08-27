// ========== 01-config.js ==========
// 默認回覆提示詞 & 語言包

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
  - "Not but..." / "Clearly yet..." / short sentence + ", eh?"
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

const LANG = {
  en: {
    settings:'Settings',wordbook:'Wordbook',apiConfig:'API',general:'GENERAL',help:'HELP',language:'Language',addApi:'Add API',editApi:'Edit API',name:'Name',key:'Key',fetchModels:'Fetch Models',fetching:'Fetching...',model:'Model',save:'Save',saveSetActive:'Save & Active',deleteApi:'Delete API',active:'Active',advanced:'ADVANCED',noApi:'No API configured.',messages:'Messages',newChar:'New Character',editChar:'Edit Character',notes:'Notes',charPrompt:'PROMPT',wbBinding:'WORLDBOOK',deleteChar:'Delete',noConversations:'No conversations.',tapCreateChar:'Tap + to create.',startConversation:'Start a conversation',noMatching:'No match.',voiceMessage:'Voice',stickers:'Stickers',copy:'Copy',delete:'Delete',manage:'Manage',done:'Done',cancel:'Cancel',send:'Send',worldbooks:'Worldbooks',newWb:'New Worldbook',editWb:'Edit Worldbook',group:'Group',globalDefault:'Global',entries:'ENTRIES',wbContent:'CONTENT',noEntries:'No entries.',deleteWb:'Delete',global:'Global',local:'Local',noWorldbooks:'No worldbooks.',tapCreateWb:'Tap + to create.',noWbAvailable:'No worldbooks',filter:'Filter',show:'SHOW',allMessages:'All',unreadOnly:'Unread',hasMessages:'Has Chat',sortLabel:'SORT',recent:'Recent',nameAZ:'A-Z',undo:'Undo',copied:'Copied',msgDeleted:'Deleted',charSaved:'Saved',apiSaved:'Saved',savedActive:'Saved & active',wbSaved:'Saved',entryAdded:'Added',enterName:'Enter name',enterUrl:'Enter URL',configApi:'Configure API first',selectModel:'Select model',deleted:'Deleted',error:'Error',urlHint:'/v1 auto-detected.',urlNotTested:'Not tested',urlOk:'Connected',urlFail:'Failed',tryingUrl:'Testing...',foundModels:'models',errNetwork:'Cannot connect.',errAuth:'Invalid key.',errRateLimit:'Rate limited.',errEmptyList:'No models.',errUnknown:'Error',
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
    consolidating:'Consolidating...',// ========== 01-config.js ==========
// 在 LANG.en 对象末尾追加（逗号衔接上一行）：

    // Chat Settings i18n keys
    csChatSettings:'Chat Settings',// ===== 追加到 LANG.en 的 Meeting 区块（替换原有同名 key） =====

    // ── Meeting (Batch 1 — Revised) ──
    meetingTitle:'Meeting',
    meetingContinue:'Continue',
    meetingIF:'IF',
    meetingNewSession:'New Session',
    meetingSessionName:'Session Name',
    meetingSessionNamePh:'Enter session name',
    meetingMode:'MODE',
    meetingCharPerspective:'CHARACTER PERSPECTIVE',
    meetingCharPerspectiveHint:'Controls the person used when AI character replies',
    meetingUserPerspective:'USER PERSPECTIVE',
    meetingUserPerspectiveHint:'Controls the person used when you write',
    meetingCharPerspectiveShort:'Char',
    meetingUserPerspectiveShort:'User',
    meetingFirstPerson:'First Person',
    meetingSecondPerson:'Second Person',
    meetingThirdPerson:'Third Person',
    meetingWordCount:'WORD COUNT',
    meetingMin:'Min',
    meetingMax:'Max',
    meetingCharacters:'CHARACTERS',
    meetingTurnSummary:'TURN SUMMARY',
    meetingTurnSummaryEnable:'Enable turn summary',
    meetingTurnSummaryHint:'Automatically summarize every N turns',
    meetingWorldview:'WORLDVIEW',
    meetingWorldviewPh:'Enter worldview setting...',
    meetingIdentity:'IDENTITY',
    meetingIdentityPh:'Enter identity setting...',
    meetingStart:'Start',
    meetingNoSessions:'No sessions yet',
    meetingCreateFirst:'Tap + to create a new session',
    meetingNoCharsAvail:'No characters available',
    meetingNoCharsSelected:'No characters',
    meetingNameRequired:'Session name is required',
    meetingWords:'words',
    meetingSystem:'System',
    meetingYou:'You',
    meetingDemoIntro:'The story begins here. The narrator sets the scene, describing the world your characters inhabit and the circumstances that bring them together...',
    meetingDemoChar:'The character responds to the unfolding narrative. Their words and actions reflect their personality, history, and current emotional state...',
    meetingDemoUser:'You continue the story, guiding your perspective through the scene. Your choices shape the direction of the narrative...',
    meetingBeginStory:'Begin your story',
    meetingWritePh:'Your turn to write...',
    meetingUiOnly:'UI placeholder — writing feature coming soon',
    meetingEndSession:'End Session',

    csReplyCount:'Reply Count',
    csReplyCountSub:'Messages per response',
    csMinCount:'Minimum',
    csMaxCount:'Maximum',
    csReplyCountHint:'AI will randomly choose a reply count within this range and split into multiple messages.',
    csTimeAwareness:'Time Awareness',
    csTimeAwarenessSub:'Current date and time',
    csEnableTime:'Enable Time Awareness',
    csTimeHint:'When enabled, AI will know the current date and time when replying.',
    csCharRecall:'Character Recall',
    csCharRecallSub:'Spontaneous message withdrawal',
    csEnableRecall:'Enable Character Recall',
    csRecallHint:'When enabled, characters may spontaneously recall messages after sending them.',
    csAutoMoments:'Auto-publish Moments',
    csAutoMomentsSub:'Automatic timeline posts',
    csEnableMoments:'Enable Auto Moments',
    csIntervalHours:'Interval (hours)',
    csForcePublish:'Publish Now',
    csAutoMomentsHint:'Characters will automatically post to Moments at the configured interval.',
    csReplyLang:'Reply Language',
    csReplyLangSub:'Character response language',
    csLanguage:'Language',
    csReplyLangHint:'Choose the language characters use when replying.',
    csTranslation:'Translation',
    csTranslationSub:'Inline message translation',
    csEnableTranslation:'Enable Translation',
    csTranslationHint:'When enabled, character messages will include a translation. Tap the bubble to view.',
    csAutoMessage:'Auto Message',
    csAutoMessageSub:'Periodic character messages',    // ── Meeting (Batch 1) ──
    meetingTitle:'Meeting',
    meetingContinue:'Continue',
    meetingIF:'IF',
    meetingNewSession:'New Session',
    meetingSessionName:'Session Name',
    meetingSessionNamePh:'Enter session name',
    meetingMode:'MODE',
    meetingPerson:'PERSON',
    meetingFirstPerson:'First Person',
    meetingThirdPerson:'Third Person',
    meetingWordCount:'WORD COUNT',
    meetingMin:'Min',
    meetingMax:'Max',
    meetingCharacters:'CHARACTERS',
    meetingTurnSummary:'TURN SUMMARY',
    meetingTurnSummaryEnable:'Enable turn summary',
    meetingTurnSummaryHint:'Automatically summarize every N turns',
    meetingWorldview:'WORLDVIEW / IDENTITY',
    meetingWorldviewPh:'Enter worldview or identity setting...',
    meetingStart:'Start',
    meetingNoSessions:'No sessions yet',
    meetingCreateFirst:'Tap + to create a new session',
    meetingNoCharsAvail:'No characters available',
    meetingNoCharsSelected:'No characters',
    meetingNameRequired:'Session name is required',
    meetingWords:'words',
    meetingSystem:'System',
    meetingYou:'You',
    meetingDemoIntro:'The story begins here. The narrator sets the scene, describing the world your characters inhabit and the circumstances that bring them together...',
    meetingDemoChar:'The character responds to the unfolding narrative. Their words and actions reflect their personality, history, and current emotional state...',
    meetingDemoUser:'You continue the story, guiding your perspective through the scene. Your choices shape the direction of the narrative...',
    meetingBeginStory:'Begin your story',
    meetingWritePh:'Your turn to write...',
    meetingUiOnly:'UI placeholder — writing feature coming soon',
    meetingEndSession:'End Session',
    csEnableAutoMsg:'Enable Auto Message',
    csIntervalMinutes:'Interval (minutes)',
    csAutoMessageHint:'When enabled, the character will automatically send a message at the configured interval.',
    csFeatures:'Features',
    csFeaturesSub:'Additional capabilities',
    csUseStickers:'Sticker Pack',
    csUseStickersSub:'Allow character to use stickers',
    csForceControl:'Force Control',
    csForceControlSub:'Reserved feature',
    csTopPriority:'Top Priority',
    csTopPrioritySub:'Reserved feature',
    csFeaturesHint:'Sticker Pack: character uses stickers from your library. Force Control and Top Priority are reserved for future use.',
    csDangerZone:'Danger Zone',// ===== LANG.en — Meeting Batch 2 additions (append/replace) =====

    meetingTitle:'Meeting',
    meetingContinue:'Continue',
    meetingIF:'IF',
    meetingNewSession:'New Session',
    meetingSessionName:'Session Name',
    meetingSessionNamePh:'Enter session name',
    meetingMode:'MODE',
    meetingCharPerspective:'CHARACTER PERSPECTIVE',
    meetingCharPerspectiveHint:'Controls the person used when AI character replies',
    meetingUserPerspective:'USER PERSPECTIVE',
    meetingUserPerspectiveHint:'Controls the person used when you write',
    meetingCharPerspectiveShort:'Char',
    meetingUserPerspectiveShort:'User',
    meetingFirstPerson:'First Person',
    meetingSecondPerson:'Second Person',
    meetingThirdPerson:'Third Person',
    meetingWordCount:'WORD COUNT',
    meetingMin:'Min',
    meetingMax:'Max',
    meetingCharacters:'CHARACTERS',
    meetingTurnSummary:'TURN SUMMARY',
    meetingTurnSummaryEnable:'Enable turn summary',
    meetingTurnSummaryHint:'Automatically summarize every N turns',
    meetingSummaryInterval:'Interval (turns)',
    meetingWorldview:'WORLDVIEW',
    meetingWorldviewPh:'Enter worldview setting...',
    meetingIdentity:'IDENTITY',
    meetingIdentityPh:'Enter identity setting...',
    meetingStart:'Start',
    meetingNoSessions:'No sessions yet',
    meetingCreateFirst:'Tap + to create a new session',
    meetingNoCharsAvail:'No characters available',
    meetingNoCharsSelected:'No characters',
    meetingNameRequired:'Session name is required',meetingContextCount:    'Context Count',

    meetingWords:'words',
    meetingTurns:'turns',
    meetingSystem:'System',
    meetingYou:'You',
    meetingBeginStory:'Begin your story',
    meetingWritePh:'Your turn to write...',
    meetingUiOnly:'UI placeholder - feature coming soon',
    meetingEndSession:'End Session',
    meetingManageTitle:'Manage',
    meetingSessionInfo:'SESSION INFO',
    meetingEditableSettings:'SETTINGS',
    meetingSaveChanges:'Save Changes',
    meetingShortTermMemory:'SHORT-TERM MEMORY',
    meetingNoMemories:'No memories yet',
    meetingSummaryRound:'Summary at round',
    meetingGenerating:'Generating...',
    meetingDemoIntro:'The story begins here...',
    meetingDemoChar:'The character responds...',
    meetingDemoUser:'You continue the story...',

    csDangerZoneSub:'Irreversible actions',
    csClearAll:'Clear All Chat Data',
    csClearAllSub:'Delete all messages, memories, and bookmarks',
    csClearHint:'This action cannot be undone. All chat history, memory entries, and bookmarks for this character will be permanently deleted.',
    csGenerating:'Generating...',
    consolidated:'Long-term memory saved',
    noShortTermForConsolidate:'Not enough short-term memories',
    memorySystem:'MEMORY SYSTEM',manualSummarize:'Summarize Now',manualSummarizeHint:'Manually summarize recent conversation into a memory entry.',summarizing:'Summarizing...',summarized:'Memory saved',contextWindow:'CONTEXT WINDOW',contextHint:'Number of recent messages sent to AI as context. Fewer = faster, less tokens.',charMemories:'CHARACTER MEMORIES',noCharMemories:'No memories for this character yet.',memoryContext:'Memory & Context',editCharacter:'Edit Character',msgCount:'messages',summaryOf:'Summary of',quote:'Quote',edit:'Edit',recall:'Recall',multiSelect:'Select',bookmark:'Bookmark',bookmarks:'Bookmarks',recalled:'Recalled',edited:'Edited',bookmarked:'Bookmarked',unbookmarked:'Removed',selectedCount:'selected',deleteSelected:'Delete Selected',bookmarkSelected:'Bookmark Selected',editMessage:'Edit Message',recalledMsg:'Message recalled',noBookmarks:'No bookmarks yet',bookmarkedMessages:'BOOKMARKED MESSAGES',noBookmarksInMemory:'No bookmarks for this character',character:'Character'
  },
  zh: {
    settings:'設置',wordbook:'世界書',apiConfig:'API 配置',general:'通用',help:'幫助',language:'語言',addApi:'添加 API',editApi:'編輯 API',name:'名稱',key:'密鑰',fetchModels:'拉取模型',fetching:'拉取中...',model:'模型',save:'保存',saveSetActive:'保存並激活',deleteApi:'刪除 API',active:'活躍',advanced:'高級',noApi:'未配置 API',messages:'消息',newChar:'新建角色',editChar:'編輯角色',notes:'備註',charPrompt:'角色設定',wbBinding:'世界書',deleteChar:'刪除',noConversations:'暫無對話',tapCreateChar:'點 + 創建',startConversation:'開始對話',noMatching:'無匹配',voiceMessage:'語音',stickers:'表情包',copy:'複製',delete:'刪除',manage:'管理',done:'完成',cancel:'取消',send:'發送',worldbooks:'世界書',newWb:'新建世界書',editWb:'編輯世界書',group:'分組',globalDefault:'全局',entries:'條目',wbContent:'正文',noEntries:'暫無條目',deleteWb:'刪除',global:'全局',local:'局部',noWorldbooks:'暫無世界書',tapCreateWb:'點 + 創建',noWbAvailable:'無世界書',filter:'篩選',show:'顯示',allMessages:'全部',unreadOnly:'未讀',hasMessages:'有消息',sortLabel:'排序',recent:'最近',nameAZ:'A-Z',undo:'撤銷',copied:'已複製',msgDeleted:'已刪除',charSaved:'已保存',apiSaved:'已保存',savedActive:'已保存並激活',wbSaved:'已保存',entryAdded:'已添加',enterName:'請輸入名稱',enterUrl:'請輸入地址',configApi:'請先配置 API',selectModel:'請選擇模型',deleted:'已刪除',error:'錯誤',urlHint:'/v1 自動識別',urlNotTested:'未測試',urlOk:'已連通',urlFail:'失敗',tryingUrl:'測試中...',foundModels:'個模型',errNetwork:'連不上',errAuth:'密鑰無效',errRateLimit:'限流',errEmptyList:'無模型',errUnknown:'出錯了',
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
    longTermCount:'長期',// ===== 追加到 LANG.zh 的 Meeting 区块（替换原有同名 key） =====

    // ── Meeting (Batch 1 — Revised) ──
    meetingTitle:'Meeting',
    meetingContinue:'Continue',
    meetingIF:'IF',
    meetingNewSession:'\u65b0\u5efa\u5b58\u6863',
    meetingSessionName:'\u5b58\u6863\u540d\u79f0',
    meetingSessionNamePh:'\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingMode:'\u6a21\u5f0f',
    meetingCharPerspective:'\u89d2\u8272\u4eba\u79f0',
    meetingCharPerspectiveHint:'\u63a7\u5236 AI \u89d2\u8272\u56de\u590d\u65f6\u4f7f\u7528\u7684\u4eba\u79f0',
    meetingUserPerspective:'\u7528\u6237\u4eba\u79f0',
    meetingUserPerspectiveHint:'\u63a7\u5236\u4f60\u4e66\u5199\u65f6\u4f7f\u7528\u7684\u4eba\u79f0',
    meetingCharPerspectiveShort:'\u89d2\u8272',
    meetingUserPerspectiveShort:'\u7528\u6237',
    meetingFirstPerson:'\u7b2c\u4e00\u4eba\u79f0',
    meetingSecondPerson:'\u7b2c\u4e8c\u4eba\u79f0',
    meetingThirdPerson:'\u7b2c\u4e09\u4eba\u79f0',
    meetingWordCount:'\u5b57\u6570',
    meetingMin:'\u6700\u5c11',
    meetingMax:'\u6700\u591a',
    meetingCharacters:'\u89d2\u8272\u9009\u62e9',
    meetingTurnSummary:'\u8f6e\u6b21\u603b\u7ed3',
    meetingTurnSummaryEnable:'\u542f\u7528\u8f6e\u6b21\u603b\u7ed3',
    meetingTurnSummaryHint:'\u6bcf N \u8f6e\u81ea\u52a8\u603b\u7ed3',
    meetingWorldview:'\u4e16\u754c\u89c2',
    meetingWorldviewPh:'\u8f93\u5165\u4e16\u754c\u89c2\u8bbe\u5b9a...',
    meetingIdentity:'\u8eab\u4efd',
    meetingIdentityPh:'\u8f93\u5165\u8eab\u4efd\u8bbe\u5b9a...',
    meetingStart:'\u5f00\u59cb',
    meetingNoSessions:'\u6682\u65e0\u5b58\u6863',
    meetingCreateFirst:'\u70b9\u51fb + \u521b\u5efa\u65b0\u5b58\u6863',
    meetingNoCharsAvail:'\u6682\u65e0\u89d2\u8272',
    meetingNoCharsSelected:'\u672a\u9009\u62e9\u89d2\u8272',
    meetingNameRequired:'\u8bf7\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingWords:'\u5b57',
    meetingSystem:'\u7cfb\u7edf',
    meetingYou:'\u4f60',
    meetingDemoIntro:'\u6545\u4e8b\u4ece\u8fd9\u91cc\u5f00\u59cb\u3002\u53d9\u8ff0\u8005\u8bbe\u5b9a\u573a\u666f\uff0c\u63cf\u8ff0\u89d2\u8272\u6240\u5904\u7684\u4e16\u754c\u548c\u4ed6\u4eec\u76f8\u805a\u7684\u7f18\u7531...',
    meetingDemoChar:'\u89d2\u8272\u56de\u5e94\u53d9\u4e8b\u7684\u5c55\u5f00\u3002\u4ed6\u4eec\u7684\u8a00\u884c\u53cd\u6620\u4e86\u6027\u683c\u3001\u5386\u53f2\u548c\u5f53\u524d\u7684\u60c5\u7eea\u72b6\u6001...',
    meetingDemoUser:'\u4f60\u7ee7\u7eed\u6545\u4e8b\uff0c\u7528\u81ea\u5df1\u7684\u884c\u52a8\u548c\u8bed\u8a00\u5f15\u5bfc\u573a\u666f\u3002\u4f60\u7684\u9009\u62e9\u5851\u9020\u53d9\u4e8b\u7684\u65b9\u5411...',
    meetingBeginStory:'\u5f00\u59cb\u4f60\u7684\u6545\u4e8b',
    meetingWritePh:'\u8f6e\u5230\u4f60\u4e66\u5199...',
    meetingUiOnly:'UI \u5360\u4f4d \u2014 \u5199\u4f5c\u529f\u80fd\u5373\u5c06\u5230\u6765',
    meetingEndSession:'\u7ed3\u675f\u5b58\u6863',

    stmLabel:'短期',
    ltmLabel:'長期',
    consolidateInterval:'合併間隔',
    consolidateHint:'每多少條短期記憶合併為一條長期記憶。',
    consolidateNow:'立即合併',
    consolidateNowHint:'手動將近期短期記憶合併為長期記憶。',
    consolidating:'合併中...',
    consolidated:'長期記憶已保存',
    noShortTermForConsolidate:'短期記憶不足',
    csChatSettings:'聊天设置',
    csReplyCount:'回复条数',
    csReplyCountSub:'每次回复消息数',
    csMinCount:'最少',
    csMaxCount:'最多',
    csReplyCountHint:'AI 将在此范围内随机选择回复条数，拆分为多条消息发送。',
    csTimeAwareness:'时间感知',// ===== LANG.zh — Meeting Batch 2 additions (append/replace) =====

    meetingTitle:'Meeting',
    meetingContinue:'Continue',
    meetingIF:'IF',
    meetingNewSession:'\u65b0\u5efa\u5b58\u6863',
    meetingSessionName:'\u5b58\u6863\u540d\u79f0',
    meetingSessionNamePh:'\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingMode:'\u6a21\u5f0f',
    meetingCharPerspective:'\u89d2\u8272\u4eba\u79f0',
    meetingCharPerspectiveHint:'\u63a7\u5236 AI \u89d2\u8272\u56de\u590d\u65f6\u4f7f\u7528\u7684\u4eba\u79f0',
    meetingUserPerspective:'\u7528\u6237\u4eba\u79f0',
    meetingUserPerspectiveHint:'\u63a7\u5236\u4f60\u4e66\u5199\u65f6\u4f7f\u7528\u7684\u4eba\u79f0',
    meetingCharPerspectiveShort:'\u89d2\u8272',
    meetingUserPerspectiveShort:'\u7528\u6237',
    meetingFirstPerson:'\u7b2c\u4e00\u4eba\u79f0',
    meetingSecondPerson:'\u7b2c\u4e8c\u4eba\u79f0',
    meetingThirdPerson:'\u7b2c\u4e09\u4eba\u79f0',
    meetingWordCount:'\u5b57\u6570',
    meetingMin:'\u6700\u5c11',
    meetingMax:'\u6700\u591a',
    meetingCharacters:'\u89d2\u8272\u9009\u62e9',
    meetingTurnSummary:'\u8f6e\u6b21\u603b\u7ed3',
    meetingTurnSummaryEnable:'\u542f\u7528\u8f6e\u6b21\u603b\u7ed3',
    meetingTurnSummaryHint:'\u6bcf N \u8f6e\u81ea\u52a8\u603b\u7ed3',
    meetingSummaryInterval:'\u95f4\u9694\uff08\u8f6e\uff09',
    meetingWorldview:'\u4e16\u754c\u89c2',
    meetingWorldviewPh:'\u8f93\u5165\u4e16\u754c\u89c2\u8bbe\u5b9a...',
    meetingIdentity:'\u8eab\u4efd',
    meetingIdentityPh:'\u8f93\u5165\u8eab\u4efd\u8bbe\u5b9a...',
    meetingStart:'\u5f00\u59cb',
    meetingNoSessions:'\u6682\u65e0\u5b58\u6863',
    meetingCreateFirst:'\u70b9\u51fb + \u521b\u5efa\u65b0\u5b58\u6863',
    meetingNoCharsAvail:'\u6682\u65e0\u89d2\u8272',
    meetingNoCharsSelected:'\u672a\u9009\u62e9\u89d2\u8272',
    meetingNameRequired:'\u8bf7\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingWords:'\u5b57',
    meetingTurns:'\u8f6e',
    meetingSystem:'\u7cfb\u7edf',
    meetingYou:'\u4f60',
    meetingBeginStory:'\u5f00\u59cb\u4f60\u7684\u6545\u4e8b',
    meetingWritePh:'\u8f6e\u5230\u4f60\u4e66\u5199...',
    meetingUiOnly:'UI \u5360\u4f4d \u2014 \u529f\u80fd\u5373\u5c06\u5230\u6765',
    meetingEndSession:'\u7ed3\u675f\u5b58\u6863',
    meetingManageTitle:'\u7ba1\u7406',
    meetingSessionInfo:'\u5b58\u6863\u4fe1\u606f',
    meetingEditableSettings:'\u8bbe\u7f6e',
    meetingSaveChanges:'\u4fdd\u5b58\u66f4\u6539',
    meetingShortTermMemory:'\u77ed\u671f\u8bb0\u5fc6',
    meetingNoMemories:'\u6682\u65e0\u8bb0\u5fc6',
    meetingSummaryRound:'\u7b2c N \u8f6e\u603b\u7ed3',
    meetingGenerating:'\u751f\u6210\u4e2d...',
    meetingDemoIntro:'\u6545\u4e8b\u4ece\u8fd9\u91cc\u5f00\u59cb...',
    meetingDemoChar:'\u89d2\u8272\u56de\u5e94...',
    meetingDemoUser:'\u4f60\u7ee7\u7eed\u6545\u4e8b...',meetingContextCount:    '\u4e0a\u4e0b\u6587\u6761\u6570',


    csTimeAwarenessSub:'当前日期和时间',
    csEnableTime:'启用时间感知',
    csTimeHint:'开启后，AI 回复时会知道当前的具体日期和时间。',
    csCharRecall:'角色撤回',
    csCharRecallSub:'主动撤回消息',
    csEnableRecall:'启用角色撤回',
    csRecallHint:'开启后，角色有一定概率在发送消息后主动撤回。',
    csAutoMoments:'自动发朋友圈',
    csAutoMomentsSub:'自动发布动态',
    csEnableMoments:'启用自动朋友圈',
    csIntervalHours:'间隔（小时）',
    csForcePublish:'立即发送',
    csAutoMomentsHint:'角色将按设定的间隔自动发一条朋友圈。',
    csReplyLang:'回复语言',
    csReplyLangSub:'角色回复所用语言',
    csLanguage:'语言',    // ── Meeting (Batch 1) ──
    meetingTitle:'Meeting',
    meetingContinue:'Continue',
    meetingIF:'IF',
    meetingNewSession:'\u65b0\u5efa\u5b58\u6863',
    meetingSessionName:'\u5b58\u6863\u540d\u79f0',
    meetingSessionNamePh:'\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingMode:'\u6a21\u5f0f',
    meetingPerson:'\u4eba\u79f0',
    meetingFirstPerson:'\u7b2c\u4e00\u4eba\u79f0',
    meetingThirdPerson:'\u7b2c\u4e09\u4eba\u79f0',
    meetingWordCount:'\u5b57\u6570',
    meetingMin:'\u6700\u5c11',
    meetingMax:'\u6700\u591a',
    meetingCharacters:'\u89d2\u8272\u9009\u62e9',
    meetingTurnSummary:'\u8f6e\u6b21\u603b\u7ed3',
    meetingTurnSummaryEnable:'\u542f\u7528\u8f6e\u6b21\u603b\u7ed3',
    meetingTurnSummaryHint:'\u6bcf N \u8f6e\u81ea\u52a8\u603b\u7ed3',
    meetingWorldview:'\u4e16\u754c\u89c2 / \u8eab\u4efd\u8bbe\u5b9a',
    meetingWorldviewPh:'\u8f93\u5165\u4e16\u754c\u89c2\u6216\u8eab\u4efd\u8bbe\u5b9a...',
    meetingStart:'\u5f00\u59cb',
    meetingNoSessions:'\u6682\u65e0\u5b58\u6863',
    meetingCreateFirst:'\u70b9\u51fb + \u521b\u5efa\u65b0\u5b58\u6863',
    meetingNoCharsAvail:'\u6682\u65e0\u89d2\u8272',
    meetingNoCharsSelected:'\u672a\u9009\u62e9\u89d2\u8272',
    meetingNameRequired:'\u8bf7\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingWords:'\u5b57',
    meetingSystem:'\u7cfb\u7edf',
    meetingYou:'\u4f60',
    meetingDemoIntro:'\u6545\u4e8b\u4ece\u8fd9\u91cc\u5f00\u59cb\u3002\u53d9\u8ff0\u8005\u8bbe\u5b9a\u573a\u666f\uff0c\u63cf\u8ff0\u89d2\u8272\u6240\u5904\u7684\u4e16\u754c\u548c\u4ed6\u4eec\u76f8\u805a\u7684\u7f18\u7531...',
    meetingDemoChar:'\u89d2\u8272\u56de\u5e94\u53d9\u4e8b\u7684\u5c55\u5f00\u3002\u4ed6\u4eec\u7684\u8a00\u884c\u53cd\u6620\u4e86\u6027\u683c\u3001\u5386\u53f2\u548c\u5f53\u524d\u7684\u60c5\u7eea\u72b6\u6001...',
    meetingDemoUser:'\u4f60\u7ee7\u7eed\u6545\u4e8b\uff0c\u7528\u81ea\u5df1\u7684\u884c\u52a8\u548c\u8bed\u8a00\u5f15\u5bfc\u573a\u666f\u3002\u4f60\u7684\u9009\u62e9\u5851\u9020\u53d9\u4e8b\u7684\u65b9\u5411...',
    meetingBeginStory:'\u5f00\u59cb\u4f60\u7684\u6545\u4e8b',
    meetingWritePh:'\u8f6e\u5230\u4f60\u4e66\u5199...',
    meetingUiOnly:'UI \u5360\u4f4d \u2014 \u5199\u4f5c\u529f\u80fd\u5373\u5c06\u5230\u6765',
    meetingEndSession:'\u7ed3\u675f\u5b58\u6863',
    csReplyLangHint:'选择角色回复时使用的语言。',
    csTranslation:'翻译',
    csTranslationSub:'消息内联翻译',
    csEnableTranslation:'启用翻译',
    csTranslationHint:'开启后，角色消息将附带简体中文翻译，点击气泡即可查看。',
    csAutoMessage:'自动发消息',
    csAutoMessageSub:'定时角色消息',
    csEnableAutoMsg:'启用自动发消息',
    csIntervalMinutes:'间隔（分钟）',
    csAutoMessageHint:'启用后，角色将按设定间隔自动发送一条消息。',
    csFeatures:'功能',
    csFeaturesSub:'附加功能',
    csUseStickers:'表情包',
    csUseStickersSub:'允许角色使用表情包',
    csForceControl:'强控',
    csForceControlSub:'预留功能',
    csTopPriority:'顶号',
    csTopPrioritySub:'预留功能',
    csFeaturesHint:'表情包：角色可使用表情包库中的表情。强控和顶号为预留功能。',
    csDangerZone:'危险区域',
    csDangerZoneSub:'不可撤销操作',
    csClearAll:'清空所有聊天数据',
    csClearAllSub:'删除所有消息、记忆和收藏',
    csClearHint:'此操作不可撤销。该角色的所有聊天记录、记忆条目和收藏消息将被永久删除。',
    csGenerating:'生成中...',
    memorySystem:'記憶系統',manualSummarize:'立即總結',manualSummarizeHint:'手動將近期對話總結為一條記憶。',summarizing:'總結中...',summarized:'記憶已保存',contextWindow:'上下文窗口',contextHint:'發送給 AI 的最近消息數量。越少 = 越快，消耗更少。',charMemories:'角色記憶',noCharMemories:'暫無該角色的記憶。',memoryContext:'記憶與上下文',editCharacter:'編輯角色',msgCount:'條消息',summaryOf:'摘要：',quote:'引用',edit:'編輯',recall:'撤回',multiSelect:'多選',bookmark:'收藏',bookmarks:'收藏',recalled:'已撤回',edited:'已編輯',bookmarked:'已收藏',unbookmarked:'已取消',selectedCount:'已選',deleteSelected:'刪除所選',bookmarkSelected:'收藏所選',editMessage:'編輯消息',recalledMsg:'消息已撤回',noBookmarks:'暫無收藏',bookmarkedMessages:'收藏的消息',noBookmarksInMemory:'暫無該角色的收藏',character:'角色'
  }
};
