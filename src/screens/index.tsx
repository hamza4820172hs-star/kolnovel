import React,{useCallback,useEffect,useState} from 'react';
import {View,Text,ScrollView,FlatList,Pressable,TextInput,Alert,StyleSheet} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {RootStackParamList} from '../../App';
import {Book,addBook,getBook,listBooks,toggleFavorite,touchBook} from '../db/books';
import {Screen,SectionTitle,EmptyState,BookTile} from '../ui/components';
import {Palette as P} from '../ui/theme';

type Nav=NativeStackScreenProps<RootStackParamList,'Novel'>['navigation'];
function useBooks(){const [books,setBooks]=useState<Book[]>([]);const refresh=()=>setBooks(listBooks());useFocusEffect(useCallback(()=>{refresh();},[]));return {books,refresh};}
function Header({title,subtitle}:{title:string;subtitle?:string}){return <View style={{marginBottom:16}}><Text style={st.brand}>NOVEL READER</Text><Text style={st.heading}>{title}</Text>{subtitle?<Text style={st.sub}>{subtitle}</Text>:null}</View>}
async function importEpub(refresh:()=>void){
 const pick=await DocumentPicker.getDocumentAsync({type:['application/epub+zip','application/zip','*/*'],copyToCacheDirectory:true});
 if(pick.canceled)return;
 const f=pick.assets[0];
 if(!f.name.toLowerCase().endsWith('.epub')){Alert.alert('ملف غير مدعوم','اختر ملف EPUB.');return;}
 const dir=FileSystem.documentDirectory+'books/';
 await FileSystem.makeDirectoryAsync(dir,{intermediates:true});
 const safeName=`${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
 const target=dir+safeName;
 await FileSystem.copyAsync({from:f.uri,to:target});
 const title=f.name.replace(/\.epub$/i,'');
 addBook(title,null,target);
 refresh();
 Alert.alert('تمت إضافة الملف','تم حفظ ملف EPUB في مكتبتك. استخراج الفصول والأغلفة هو المرحلة التالية.');
}
export function HomeScreen({navigation}:any){
 const {books,refresh}=useBooks();
 return <Screen><ScrollView showsVerticalScrollIndicator={false}>
  <Header title="الرئيسية" subtitle="مكتبتك، وقراءتك، وترجماتك في مكان واحد"/>
  <View style={st.hero}><Text style={st.heroEyebrow}>مكتبتك الخاصة</Text><Text style={st.heroTitle}>عالم رواياتك يبدأ هنا</Text><Text style={st.sub}>استورد ملفات EPUB وابدأ بناء مكتبتك.</Text><Pressable style={st.goldBtn} onPress={()=>importEpub(refresh)}><Text style={st.goldBtnText}>＋ إضافة رواية EPUB</Text></Pressable></View>
  <SectionTitle>متابعة القراءة</SectionTitle>
  {books.filter(b=>b.last_opened_at).length===0?<EmptyState title="لسه مفيش روايات بدأت قراءتها" body="أضف رواية EPUB لبدء مكتبتك."/>:
   <View style={st.grid}>{books.filter(b=>b.last_opened_at).map(b=><BookTile key={b.id} title={b.title} author={b.author} onPress={()=>navigation.navigate('Novel',{bookId:b.id})}/>)}</View>}
  <SectionTitle action="عرض الكل" onAction={()=>navigation.navigate('مكتبتي')}>آخر الإضافات</SectionTitle>
  <View style={st.grid}>{books.slice(0,6).map(b=><BookTile key={b.id} title={b.title} author={b.author} onPress={()=>navigation.navigate('Novel',{bookId:b.id})}/>)}</View>
 </ScrollView></Screen>
}
export function BrowseScreen(){const {books}=useBooks();return <Screen><Header title="اكتشف" subtitle="ابحث داخل رواياتك المحلية"/><TextInput placeholder="ابحث عن رواية..." placeholderTextColor={P.muted} style={st.input}/><EmptyState title="مكتبتك هي عالمك" body={`${books.length} رواية مستوردة حتى الآن. لا يوجد اتصال بسيرفر روايات.`}/></Screen>}
export function LibraryScreen({navigation}:any){const {books,refresh}=useBooks();return <Screen><Header title="مكتبتي" subtitle={`${books.length} رواية`}/><View style={st.row}><Pressable style={st.goldBtn} onPress={()=>importEpub(refresh)}><Text style={st.goldBtnText}>＋ استيراد EPUB</Text></Pressable></View>{books.length===0?<EmptyState title="المكتبة فارغة" body="استورد أول ملف EPUB من جهازك."/>:<FlatList data={books} numColumns={3} keyExtractor={b=>String(b.id)} renderItem={({item})=><BookTile title={item.title} author={item.author} favorite={!!item.is_favorite} onPress={()=>navigation.navigate('Novel',{bookId:item.id})}/>} columnWrapperStyle={{justifyContent:'space-between'}}/>}</Screen>}
export function ActivityScreen(){return <Screen><Header title="النشاط" subtitle="متابعة عمليات القراءة والترجمة"/><View style={st.chips}><Text style={st.chipActive}>سجل القراءة</Text><Text style={st.chip}>الترجمات</Text><Text style={st.chip}>التنزيلات</Text></View><EmptyState title="لا يوجد نشاط بعد" body="سيظهر هنا سجل القراءة وعمليات الترجمة عند استخدامها."/></Screen>}
export function SettingsScreen(){return <Screen><Header title="الإعدادات" subtitle="تحكم في تجربة القراءة والترجمة"/>{[['المظهر','الوضع الداكن · الفاتح · النظام'],['إعدادات القراءة','حجم الخط · تباعد الأسطر · الهوامش'],['الترجمة','MyMemory ثم Google Translate تلقائيًا'],['النسخ الاحتياطي','نسخ المكتبة أو رواية منفردة'],['التخزين','إدارة ملفات EPUB والترجمات']].map(([a,b])=><View key={a} style={st.setting}><Text style={st.settingTitle}>{a}</Text><Text style={st.sub}>{b}</Text></View>)}</Screen>}
export function NovelScreen({route,navigation}:NativeStackScreenProps<RootStackParamList,'Novel'>){
 const [book,setBook]=useState<Book|undefined>();useEffect(()=>{setBook(getBook(route.params.bookId));},[route.params.bookId]);
 if(!book)return <Screen><EmptyState title="الرواية غير موجودة" body="قد تكون حُذفت من المكتبة."/></Screen>;
 return <Screen><ScrollView><View style={st.detailCover}><Text style={{color:P.gold,fontSize:34}}>✦</Text><Text style={st.detailTitle}>{book.title}</Text><Text style={st.sub}>{book.author||'مؤلف غير معروف'}</Text></View><SectionTitle>عن الرواية</SectionTitle><Text style={st.sub}>ملف EPUB محلي · أضيفت إلى المكتبة</Text><Pressable style={st.goldBtn} onPress={()=>{touchBook(book.id);navigation.navigate('Reader',{bookId:book.id});}}><Text style={st.goldBtnText}>ابدأ القراءة</Text></Pressable><Pressable style={st.outlineBtn} onPress={()=>{toggleFavorite(book.id);setBook(getBook(book.id));}}><Text style={st.outlineText}>{book.is_favorite?'إزالة من المفضلة':'إضافة للمفضلة'}</Text></Pressable><SectionTitle>الفصول</SectionTitle><EmptyState title="لم يتم استخراج الفصول بعد" body="محرك تحليل EPUB سيُضاف في المرحلة التالية."/></ScrollView></Screen>
}
export function ReaderScreen({route,navigation}:NativeStackScreenProps<RootStackParamList,'Reader'>){
 const book=getBook(route.params.bookId);
 return <View style={{flex:1,backgroundColor:'#E9DFC9',padding:24}}><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:24}}><Pressable onPress={()=>navigation.goBack()}><Text style={{color:'#28241F'}}>رجوع</Text></Pressable><Text style={{color:'#28241F',fontWeight:'700'}}>القارئ</Text><Pressable onPress={()=>Alert.alert('الفهرس','سيتم ربط الفهرس بعد استخراج فصول EPUB.')}><Text style={{color:'#28241F'}}>الفهرس</Text></Pressable></View><Text style={{color:'#28241F',fontSize:22,fontWeight:'800',textAlign:'center'}}>{book?.title}</Text><View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:'#62594C',textAlign:'center',lineHeight:28}}>تم حفظ ملف الرواية. الخطوة التالية هي تحليل بنية EPUB واستخراج الفصول والنصوص والأغلفة لعرضها هنا.</Text></View></View>
}
const st=StyleSheet.create({
 brand:{color:P.gold,fontSize:10,fontWeight:'900',letterSpacing:3},heading:{color:P.text,fontSize:28,fontWeight:'900',marginTop:5},sub:{color:P.muted,fontSize:13,marginTop:5,lineHeight:20},
 hero:{backgroundColor:P.panel2,borderRadius:18,padding:20,borderWidth:1,borderColor:'#4B4436'},heroEyebrow:{color:P.gold,fontSize:12,fontWeight:'800'},heroTitle:{color:P.text,fontSize:22,fontWeight:'900',marginTop:8,marginBottom:4},
 goldBtn:{backgroundColor:P.gold,borderRadius:12,paddingVertical:13,paddingHorizontal:16,alignItems:'center',alignSelf:'flex-start',marginTop:14},goldBtnText:{color:'#171717',fontWeight:'900',fontSize:13},
 outlineBtn:{borderWidth:1,borderColor:P.gold,borderRadius:12,padding:13,alignItems:'center',marginTop:12},outlineText:{color:P.gold,fontWeight:'800'},
 grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},row:{flexDirection:'row',justifyContent:'flex-end'},input:{backgroundColor:P.panel,borderColor:P.line,borderWidth:1,borderRadius:12,padding:13,color:P.text},
 chips:{flexDirection:'row',gap:8,marginTop:8},chip:{color:P.muted,borderWidth:1,borderColor:P.line,borderRadius:20,padding:9,overflow:'hidden'},chipActive:{color:P.gold,borderWidth:1,borderColor:P.gold,borderRadius:20,padding:9,overflow:'hidden'},
 setting:{paddingVertical:17,borderBottomWidth:1,borderBottomColor:P.line},settingTitle:{color:P.text,fontSize:16,fontWeight:'800'},
 detailCover:{height:210,backgroundColor:P.panel2,borderRadius:18,alignItems:'center',justifyContent:'center',padding:20,marginBottom:12},detailTitle:{color:P.text,fontSize:23,fontWeight:'900',textAlign:'center',marginVertical:12}
});
