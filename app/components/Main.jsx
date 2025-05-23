import { useEffect, useRef, useState } from "react";
import click from '../assets/audio/click.wav'
import trans from '../assets/audio/transition.wav'

export function Main() {

    const COLOR_COMPARE = "#38CC77"
    const COLOR_SWAP = "#E21717"
    const COLOR_UNSORTED = "#E03B8B"
    const COLOR_SORTED = "#5A20CB"
    const COLOR_SORT_T = "#F7CD2E"

    // arrowRef
    const arrowRef = useRef({ p1: null, p2: null })
    const currentStep = useRef(0)
    const countSorted = useRef(1)
    const inputRef = useRef(null)

    const [sortCompleted, setSortCompleted] = useState(false);
    const [values, setValues] = useState([45, 5, 6, 65, 52, 82, 12, 2, 100, 24]);
    const [sorted, setSorted] = useState([]);
    //stores the index of selected item
    const [selectedElements, setSelectedElements] = useState([]);
    const [isAsc, setIsAsc] = useState(true);
    const [algo, setAlgo] = useState("Bubble");

    const playTimeRef = useRef(-1)
    const nextBtnRef = useRef(null)
    const [onPlay, setonPlay] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const p2RefSelection = useRef(null)
    const p1_p2 = useRef("p1")
    const audioClickRef = useRef(null)
    const audioTransRef = useRef(null)


    useEffect(() => {
        clearInterval(playTimeRef.current)
        playTimeRef.current = -1
        setonPlay(false)
    }, [sortCompleted]);

    const play = () => {
        const pl = setInterval(() => nextBtnRef.current.click(), 850)
        playTimeRef.current = pl
        setonPlay(true)
    }
    const pause = () => {
        clearInterval(playTimeRef.current)
        playTimeRef.current = -1
        setonPlay(false)
    }



    useEffect(() => {
        setSorted([...values])
        // reset all other parameters
        setSelectedElements([])
        currentStep.current = 0
        countSorted.current = 1
        arrowRef.current = { p1: null, p2: null }
        setSortCompleted(false)
        clearInterval(playTimeRef.current)
        setonPlay(false)
        playTimeRef.current = -1
    }, [values, isAsc, algo]);

    function nextStep_Insertion() {
        if (currentStep.current === 0) {
            setSelectedElements([1, 0]) //[base,previous]
            currentStep.current = 1
        }
        else if (currentStep.current === 1) {
            if (isAsc ? sorted[selectedElements[0]] < sorted[selectedElements[1]] : sorted[selectedElements[0]] > sorted[selectedElements[1]]) {
                if (selectedElements[1] - 1 >= 0 && isAsc ? sorted[selectedElements[1] - 1] > sorted[selectedElements[0]] : sorted[selectedElements[1] - 1] < sorted[selectedElements[0]])
                    setSelectedElements(p => [p[0], p[1] - 1])
                else {
                    audioClickRef.current.pause()
                    audioTransRef.current.play()
                    let p1 = arrowRef.current.p1.getBoundingClientRect().y, p2 = arrowRef.current.p2.getBoundingClientRect().y;
                    arrowRef.current.p1.style.backgroundColor = COLOR_SWAP;
                    arrowRef.current.p1.classList.add("swapEle");
                    arrowRef.current.p1.style.position = `absolute`;
                    arrowRef.current.p1.style.transform = `translateY(${(p2 - p1) - arrowRef.current.p2.offsetHeight - 24}px)`; //static 24px for default margin
                    arrowRef.current.p2.style.backgroundColor = COLOR_SWAP;
                    arrowRef.current.p2.style.marginTop = `${arrowRef.current.p2.offsetHeight + 24}px`;
                    currentStep.current = 2
                }
            }
            else {
                countSorted.current += 1
                setSelectedElements(p => {
                    if (p[0] >= sorted.length)
                        setSortCompleted(true)
                    return [p[0] + 1, p[0]]
                })
            }
        }
        else if (currentStep.current === 2) {
            // reset the animation
            arrowRef.current.p1.style.backgroundColor = COLOR_COMPARE;
            arrowRef.current.p1.classList.remove("swapEle");
            arrowRef.current.p1.style.position = ``;
            arrowRef.current.p1.style.transform = '';
            arrowRef.current.p2.style.backgroundColor = COLOR_COMPARE;
            arrowRef.current.p2.classList.remove("swapEle");
            arrowRef.current.p2.style.transform = '';
            arrowRef.current.p2.style.marginTop = '';

            setSorted(pre => {
                const p = [...pre]
                // remove base value
                const [baseValue] = p.splice(selectedElements[0], 1)
                // add base value to appropriate position
                p.splice(selectedElements[1], 0, baseValue)
                return p
            })
            // increase sorted count
            countSorted.current += 1
            // move to step 1
            currentStep.current = 1
            // move selection 
            setSelectedElements(p => {
                if (p[0] >= sorted.length)
                    setSortCompleted(true)
                return [p[0] + 1, p[0]]
            })

        }
    }

    function nextStep_Selection() {
        // for selection sort
        if (currentStep.current === 0)
            // select 2 elements
            setSelectedElements(p => {
                if (sorted.length - countSorted.current <= 0) { countSorted.current = sorted.length + 1; setSortCompleted(true); return ([]) }
                const first = countSorted.current - 1;
                //check the selected elements is smaller than next element
                currentStep.current = 1;
                return [first, first + 1];
            });

        // if first element is greater than second element, mark for swap otherwise getting select next 2 elements
        else if (currentStep.current === 1) {
            if (sorted.length - 1 <= selectedElements[1]) {
                // arrowRef.current.p1.style.backgroundColor = COLOR_SWAP;
                // arrowRef.current.p2.style.backgroundColor = COLOR_SWAP;
                currentStep.current = 2;
                audioClickRef.current.pause()
                audioTransRef.current.play()
            }
            if (isAsc ? sorted[selectedElements[0]] > sorted[selectedElements[1]] : sorted[selectedElements[0]] < sorted[selectedElements[1]]) {
                p1_p2.current = "p2";
                setSelectedElements(p => [p[1], (p[1] + 1) >= sorted.length ? countSorted.current - 1 : p[1] + 1])
            }
            else {
                p1_p2.current = "p1";
                setSelectedElements(p => [p[0], (p[1] + 1) >= sorted.length ? countSorted.current - 1 : p[1] + 1])
            }
        }
        // swap them
        else if (currentStep.current === 2) {
            setSorted(p => {
                const newList = [...p];
                const temp = newList[countSorted.current - 2];
                newList[countSorted.current - 2] = newList[selectedElements[0]];
                newList[selectedElements[0]] = temp;
                currentStep.current = 0;
                return newList;
            })
            countSorted.current += 1;
        }
    }

    function nextStep_Bubble() {
        // for bubble sort
        if (currentStep.current === 0)
            // select 2 elements
            setSelectedElements(p => {
                const first = !isNaN(p[0]) ? p[0] + 1 : 0;
                currentStep.current = 1;
                //validate the length of the array
                if (first >= sorted.length - countSorted.current) {
                    // for sort completion
                    if (sorted.length - countSorted.current <= 0) { countSorted.current = sorted.length + 1; setSortCompleted(true); return ([]) }
                    else countSorted.current += 1;
                    return [0, 1];
                }
                return [first, first + 1];
            });
        // if first element is greater than second element, mark for swap otherwise getting select next 2 elements
        else if (currentStep.current === 1) {
            if (isAsc ? sorted[selectedElements[0]] > sorted[selectedElements[1]] : sorted[selectedElements[0]] < sorted[selectedElements[1]]) {
                audioClickRef.current.pause()
                audioTransRef.current.play()
                let p1 = arrowRef.current.p1.getBoundingClientRect().y, p2 = arrowRef.current.p2.getBoundingClientRect().y;
                arrowRef.current.p1.style.backgroundColor = COLOR_SWAP;
                arrowRef.current.p1.style.transform = `translateY(${p2 - p1}px)`;
                arrowRef.current.p1.classList.add("swapEle");
                arrowRef.current.p2.style.backgroundColor = COLOR_SWAP;
                arrowRef.current.p2.style.transform = `translateY(${p1 - p2}px)`;
                arrowRef.current.p2.classList.add("swapEle");
                currentStep.current = 2;
            }
            else {
                currentStep.current = 0;
                nextStep_Bubble()
            }
        }
        // swap them
        else if (currentStep.current === 2) {
            setSorted(p => {
                const newList = [...p];
                const temp = newList[selectedElements[0]];
                newList[selectedElements[0]] = newList[selectedElements[1]];
                newList[selectedElements[1]] = temp;
                currentStep.current = 0;
                // reset the selected elements style to default
                arrowRef.current.p1.style.backgroundColor = COLOR_COMPARE;
                arrowRef.current.p1.classList.remove("swapEle");
                arrowRef.current.p1.style.transform = '';
                arrowRef.current.p2.style.backgroundColor = COLOR_COMPARE;
                arrowRef.current.p2.classList.remove("swapEle");
                arrowRef.current.p2.style.transform = '';
                return newList;
            })
        }
    }

    const addElement = () => {
        const val = inputRef.current.value
        if (val === "" || isNaN(Number(val))) return;
        setValues(p => [...p, val])
        inputRef.current.value = ""
        inputRef.current.focus()
    }

    const selectAlgo = () => {
        // audioRef.current.src = click
        audioClickRef.current.play()

        switch (algo) {
            case "Bubble":
                nextStep_Bubble()
                break;
            case "Insertion":
                nextStep_Insertion()
                break;
            case "Selection":
                nextStep_Selection()
                break;
            default:
                nextStep_Bubble()
                break;
        }
    }

    const getSelectionProp = index => {
        if (algo !== "Selection" || !selectedElements.includes(index))
            return {}
        if (currentStep.current === 2) {
            let p1 = arrowRef.current[p1_p2.current].getBoundingClientRect().y, p2 = p2RefSelection.current.getBoundingClientRect().y;
            console.log(p1, p2);
            if ((countSorted.current - 1) === index)//p2
                return { transform: `translateY(${p1 - p2}px)`, transition: "all 350ms" }
            if (selectedElements[0] === index)//p1
                return { transform: `translateY(${p2 - p1}px)`, transition: "all 350ms" }
            return {}
        }
        return {}
    }

    const getColor = (index) => {
        if (selectedElements.includes(index)) {
            if (algo === "Selection" && currentStep.current === 2) {
                return COLOR_SWAP
            }
            return COLOR_COMPARE;
        }
        else {
            if (algo === "Bubble") {
                if (sorted.length - countSorted.current < index)
                    return COLOR_SORTED;
                else
                    return ""
            }
            else if (algo === "Selection" || algo === "Insertion") {
                if (countSorted.current - 1 > index)
                    return algo === "Selection" ? COLOR_SORTED : COLOR_SORT_T;
                else
                    return ""
            }
        }
    }

    return (
        <div onContextMenu={e => e.preventDefault()} className="app bg-[#242B2E] overflow-auto w-full h-screen ">
            <audio muted={isMuted} src={click} hidden ref={r => audioClickRef.current = r} ></audio>
            <audio muted={isMuted} src={trans} hidden ref={r => audioTransRef.current = r} ></audio>
            {sortCompleted && <div className="onCompletion z-10 fixed left-0 top-0 w-full h-full bg-[#0000004D] flex items-center justify-center ">
                <div className="message rounded-[50px] bg-[#6A1B4D] py-8 px-12 flex flex-col text-center justify-center items-center [&>*]:mb-4 ">
                    <h1 className=" font-bold text-4xl text-white ">Hurry ! Array has sorted successfully</h1>
                    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M115.781 71.0937C111.719 91.4062 96.4032 110.532 74.9126 114.806C64.4312 116.894 53.5585 115.621 43.8426 111.169C34.1266 106.718 26.0628 99.3146 20.7992 90.0135C15.5356 80.7125 13.3406 69.9878 14.5268 59.3667C15.713 48.7456 20.2199 38.7695 27.4057 30.8587C42.1444 14.625 67.0313 10.1562 87.3438 18.2812" stroke="#66AD47" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M46.7188 62.9688L67.0312 83.2812L115.781 30.4688" stroke="#66AD47" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div onClick={() => setTimeout(() => setSortCompleted(false), 200)} className="btn bg-[#FF6666] text-white text-[1.5rem] px-5 py-2 cursor-pointer  transition-all font-bold rounded-xl active:scale-125 ">Done</div>
                </div>
            </div>}
            <div className="head h-[5rem] flex flex-row justify-between px-16 items-center ">
                <div className="left"><h1 className="text-[2rem] bold text-white" >Values</h1> </div>
                <div className="right text-white grid grid-flow-col gap-5">
                    <div tabIndex={0} className="dropDown cursor-pointer relative [&>.dropList]:focus:visible flex flex-row justify-center items-center bg-[#6A1B4D] rounded py-1 px-2 "><span className="w-24">{algo}</span><svg width="1.5rem" height="1.5rem" viewBox="0 0 40 40" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32.8281 11.7188H7.17189C6.40235 11.7188 5.97267 12.5313 6.44923 13.0859L19.2774 27.9609C19.6445 28.3867 20.3516 28.3867 20.7227 27.9609L33.5508 13.0859C34.0274 12.5313 33.5977 11.7188 32.8281 11.7188Z" fill="white" />
                    </svg>
                        <div className="dropList invisible z-10 absolute top-[2.2rem] left-0 w-full  flex flex-col justify-center items-center bg-[#6A1B4D] rounded-b-md">
                            <div onClick={() => setAlgo("Bubble")} className="item p-2 hover:scale-105 transition-all ">Bubble</div>
                            <div onClick={() => setAlgo("Insertion")} className="item p-2 hover:scale-105 transition-all ">Insertion</div>
                            <div onClick={() => setAlgo("Selection")} className="item p-2 hover:scale-105 transition-all ">Selection</div>
                        </div>
                    </div>
                    <div className="grid grid-flow-col gap-2">
                        <label className="cursor-pointer p-1 rounded-lg shadow-2xl " htmlFor="ascOrder" style={isAsc ? { background: "#5A20CB" } : {}} >
                            <input type="radio" hidden onChange={() => setIsAsc(true)} name="order" defaultChecked id="ascOrder" />
                            <svg width="50" height="50" viewBox="0 0 1472 1792" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_25_6)">
                                    <path d="M1314 1313C1314 1271 1299.33 1232.33 1270 1197C1240.67 1161.67 1206.33 1144 1167 1144C1132.33 1144 1104.67 1156.33 1084 1181C1063.33 1205.67 1053 1237 1053 1275C1053 1313 1065.17 1344.67 1089.5 1370C1113.83 1395.33 1148.67 1408 1194 1408C1227.33 1408 1255.67 1399 1279 1381C1302.33 1363 1314 1340.33 1314 1313ZM704 1440C704 1448 700.667 1456 694 1464L375 1783C368.333 1789 360.667 1792 352 1792C344 1792 336.333 1789 329 1783L9.00002 1463C-0.999984 1452.33 -3.33332 1440.67 2.00002 1428C7.33335 1414.67 17.3333 1408 32 1408H224V32C224 22.6667 227 15 233 9C239 3 246.667 0 256 0H448C457.333 0 465 3 471 9C477 15 480 22.6667 480 32V1408H672C681.333 1408 689 1411 695 1417C701 1423 704 1430.67 704 1440ZM1454 1371C1454 1412.33 1449.67 1452.83 1441 1492.5C1432.33 1532.17 1418.67 1570.17 1400 1606.5C1381.33 1642.83 1358.67 1674.67 1332 1702C1305.33 1729.33 1272.5 1751.17 1233.5 1767.5C1194.5 1783.83 1152 1792 1106 1792C1064.67 1792 1028.67 1786.67 998 1776C982 1770.67 968 1765.67 956 1761L995 1648C1005 1652.67 1015.33 1656.33 1026 1659C1050.67 1667.67 1075.67 1672 1101 1672C1157 1672 1201.83 1652.5 1235.5 1613.5C1269.17 1574.5 1291.33 1526 1302 1468H1300C1286 1483.33 1265.5 1495.67 1238.5 1505C1211.5 1514.33 1183.33 1519 1154 1519C1083.33 1519 1025.67 1495.17 981 1447.5C936.333 1399.83 914 1342.33 914 1275C914 1205 938 1145.67 986 1097C1034 1048.33 1094.33 1024 1167 1024C1249 1024 1317.33 1055.5 1372 1118.5C1426.67 1181.5 1454 1265.67 1454 1371ZM1424 654V768H955V654H1122V222C1122 217.333 1122.17 211 1122.5 203C1122.83 195 1123 189.333 1123 186V170H1121L1114 182C1108.67 190.667 1100 201 1088 213L1026 271L944 185L1136 0H1259V654H1424Z" fill="white" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_25_6">
                                        <rect width="1472" height="1792" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </label>
                        <label className="cursor-pointer p-1 rounded-lg shadow-2xl " htmlFor="descOrder" style={isAsc ? {} : { background: "#5A20CB" }}>
                            <input type="radio" hidden onChange={() => setIsAsc(false)} name="order" id="descOrder" />
                            <svg width="50" height="50" viewBox="0 0 1472 1792" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_25_8)">
                                    <path d="M1314 289C1314 247 1299.33 208.333 1270 173C1240.67 137.667 1206.33 120 1167 120C1132.33 120 1104.67 132.333 1084 157C1063.33 181.667 1053 213 1053 251C1053 289 1065.17 320.667 1089.5 346C1113.83 371.333 1148.67 384 1194 384C1227.33 384 1255.67 375 1279 357C1302.33 339 1314 316.333 1314 289ZM704 1440C704 1448 700.667 1456 694 1464L375 1783C368.333 1789 360.667 1792 352 1792C344 1792 336.333 1789 329 1783L9.00002 1463C-0.999984 1452.33 -3.33332 1440.67 2.00002 1428C7.33335 1414.67 17.3333 1408 32 1408H224V32C224 22.6667 227 15 233 9C239 3 246.667 0 256 0H448C457.333 0 465 3 471 9C477 15 480 22.6667 480 32V1408H672C681.333 1408 689 1411 695 1417C701 1423 704 1430.67 704 1440ZM1424 1678V1792H955V1678H1122V1246C1122 1241.33 1122.17 1235 1122.5 1227C1122.83 1219 1123 1213.33 1123 1210V1194H1121L1114 1206C1108.67 1214.67 1100 1225 1088 1237L1026 1295L944 1209L1136 1024H1259V1678H1424ZM1454 347C1454 388.333 1449.67 428.833 1441 468.5C1432.33 508.167 1418.67 546.167 1400 582.5C1381.33 618.833 1358.67 650.667 1332 678C1305.33 705.333 1272.5 727.167 1233.5 743.5C1194.5 759.833 1152 768 1106 768C1064.67 768 1028.67 762.667 998 752C982 746.667 968 741.667 956 737L995 624C1005 628.667 1015.33 632.333 1026 635C1050.67 643.667 1075.67 648 1101 648C1157 648 1201.83 628.5 1235.5 589.5C1269.17 550.5 1291.33 502 1302 444H1300C1286 459.333 1265.5 471.667 1238.5 481C1211.5 490.333 1183.33 495 1154 495C1083.33 495 1025.67 471.167 981 423.5C936.333 375.833 914 318.333 914 251C914 181 938 121.667 986 73C1034 24.3333 1094.33 0 1167 0C1249 0 1317.33 31.5 1372 94.5C1426.67 157.5 1454 241.667 1454 347Z" fill="white" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_25_8">
                                        <rect width="1472" height="1792" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>

                        </label>
                    </div>
                    <div className="colorAbbr gap-1 grid grid-flow-row grid-cols-2">
                        <div className="wrap grid justify-start w-32 grid-flow-col  text-white text-sm ">
                            <div className="colorInfo w-5 h-5 shadow-sm " style={{ backgroundColor: COLOR_COMPARE }} ></div><div className="pl-2">To Compare</div>
                        </div>
                        <div className="wrap grid justify-start w-32 grid-flow-col  text-white text-sm ">
                            <div className="colorInfo w-5 h-5 shadow-sm " style={{ backgroundColor: COLOR_SWAP }} ></div><div className="pl-2">To swap</div>
                        </div>
                        <div className="wrap grid justify-start w-32 grid-flow-col  text-white text-sm ">
                            <div className="colorInfo w-5 h-5 shadow-sm " style={{ backgroundColor: COLOR_UNSORTED }} ></div><div className="pl-2">Unsorted</div>
                        </div>
                        {algo !== "Insertion" ? <div className="wrap grid justify-start w-32 grid-flow-col  text-white text-sm ">
                            <div className="colorInfo w-5 h-5 shadow-sm " style={{ backgroundColor: COLOR_SORTED }} ></div><div className="pl-2">Sorted</div>
                        </div>
                            : <div className="wrap grid justify-start w-32 grid-flow-col  text-white text-sm ">
                                <div className="colorInfo w-5 h-5 shadow-sm " style={{ backgroundColor: COLOR_SORT_T }} ></div><div className="pl-2 whitespace-nowrap">Tentatively Sorted</div>
                            </div>}
                    </div>
                    <div onClick={() => setIsMuted(p => !p)} className="mute cursor-pointer">
                        {isMuted ? <svg width="50" height="50" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M51.0625 27.3125L67.6875 48.6875M8.3125 27.3125V48.6875H20.1875L39.1875 62.9375V13.0625L20.1875 27.3125H8.3125ZM67.6875 27.3125L51.0625 48.6875L67.6875 27.3125Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg> : <svg width="50" height="50" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M54.3438 15.0312C63.5938 19.6562 68.2188 26.5938 68.2188 37C68.2188 47.4062 63.5938 54.3438 54.3438 58.9688M8.09375 26.5938V47.4062H19.6562L38.1562 61.2812V12.7188L19.6562 26.5938H8.09375ZM49.7188 28.9062C49.7188 28.9062 54.3438 31.2188 54.3438 37C54.3438 42.7812 49.7188 45.0938 49.7188 45.0938V28.9062Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>}
                    </div>
                </div>
            </div >
            <div className="body h-[calc(100%_-_5rem)]  grid grid-flow-col">
                <div className="values h-full p-2 px-10 text-white">
                    <div className="content h-[75vh] overflow-auto">
                        {values.map((value, index) => <div key={index} className="relative [&_div]:hover:opacity-100"> <div style={{ width: `${value}%` }} className="value px-2 py-1 bg-[#E03B8B] rounded-r text-[1.5rem]  my-3 ">{value} <div className="absolute opacity-0 right-2 top-1.5 active:scale-105 transition-all cursor-pointer " onClick={() => setValues(p => p.filter((v, i) => i !== index))} >
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="m10.25 5.75l-4.5 4.5m0-4.5l4.5 4.5" /><circle cx="8" cy="8" r="6.25" /></g></svg>
                        </div> </div></div>)}
                    </div>
                    <div className="footer mt-5 grid grid-flow-col justify-center gap-2">
                        <input type="text" onKeyDown={e => e.key === "Enter" && addElement()} ref={r => inputRef.current = r} className=" rounded min-w-[2rem] max-w-[5rem] w-fit border border-solid border-white p-1  bg-[#6A1B4D]" />
                        <svg onClick={addElement} className="active:scale-110 cursor-pointer transition-all" width="2rem" height="2rem" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M30 2.5C14.8125 2.5 2.5 14.8125 2.5 30C2.5 45.1875 14.8125 57.5 30 57.5C45.1875 57.5 57.5 45.1875 57.5 30C57.5 14.8125 45.1875 2.5 30 2.5ZM32.5 40C32.5 40.663 32.2366 41.2989 31.7678 41.7678C31.2989 42.2366 30.663 42.5 30 42.5C29.337 42.5 28.7011 42.2366 28.2322 41.7678C27.7634 41.2989 27.5 40.663 27.5 40V32.5H20C19.337 32.5 18.7011 32.2366 18.2322 31.7678C17.7634 31.2989 17.5 30.663 17.5 30C17.5 29.337 17.7634 28.7011 18.2322 28.2322C18.7011 27.7634 19.337 27.5 20 27.5H27.5V20C27.5 19.337 27.7634 18.7011 28.2322 18.2322C28.7011 17.7634 29.337 17.5 30 17.5C30.663 17.5 31.2989 17.7634 31.7678 18.2322C32.2366 18.7011 32.5 19.337 32.5 20V27.5H40C40.663 27.5 41.2989 27.7634 41.7678 28.2322C42.2366 28.7011 42.5 29.337 42.5 30C42.5 30.663 42.2366 31.2989 41.7678 31.7678C41.2989 32.2366 40.663 32.5 40 32.5H32.5V40Z" fill="white" />
                        </svg>
                    </div>
                </div>
                <div className="pageRender  h-full p-2 px-10 text-white">

                    <div className="content h-[75vh] overflow-auto relative ">{sorted.map((value, index) =>
                        <div key={index} style={{ width: `${value}%`, backgroundColor: `${getColor(index)}`, ...getSelectionProp(index) }}
                            ref={r => {
                                if (algo === "Selection" && index === (countSorted.current - 1))
                                    p2RefSelection.current = r
                                const eleSelectedIndex = selectedElements.indexOf(index)
                                if (eleSelectedIndex === 0)
                                    arrowRef.current.p1 = r;
                                else if (eleSelectedIndex === 1) {
                                    arrowRef.current.p2 = r; r?.scrollIntoView({ behavior: "smooth", block: "center" })
                                }
                            }} className="value px-2 py-1 select-none bg-[#E03B8B] rounded-r text-[1.5rem]  my-3">{value}</div>)}</div>

                    <div className="footer mt-5 grid grid-flow-col justify-evenly ">
                        {/* <svg className="cursor-pointer active:scale-110 transition-all " width="2rem" height="2rem" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M30 2.5C14.8125 2.5 2.5 14.8125 2.5 30C2.5 45.1875 14.8125 57.5 30 57.5C45.1875 57.5 57.5 45.1875 57.5 30C57.5 14.8125 45.1875 2.5 30 2.5ZM35 22C35.0041 21.6452 34.9148 21.2956 34.741 20.9862C34.5672 20.6768 34.3151 20.4186 34.01 20.2375C33.7136 20.067 33.3742 19.9857 33.0327 20.0034C32.6912 20.0212 32.3621 20.1372 32.085 20.3375L20.835 28.3375C20.5738 28.5284 20.3619 28.7788 20.2167 29.0679C20.0715 29.357 19.9972 29.6765 20 30C20 30.67 20.3125 31.2925 20.835 31.665L32.085 39.665C32.3621 39.8653 32.6912 39.9813 33.0327 39.9991C33.3742 40.0168 33.7136 39.9355 34.01 39.765C34.3155 39.5837 34.5678 39.3251 34.7416 39.0152C34.9154 38.7054 35.0045 38.3552 35 38V22Z" fill="white" />
            </svg> */}

                        {!onPlay ? <div className="h-12 items-center flex">
                            <svg onClick={play} className="cursor-pointer active:scale-110 transition-all " width="2rem" height="2rem" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="60" height="60" rx="30" fill="white" />
                                <path d="M30 3.75C15.5039 3.75 3.75 15.5039 3.75 30C3.75 44.4961 15.5039 56.25 30 56.25C44.4961 56.25 56.25 44.4961 56.25 30C56.25 15.5039 44.4961 3.75 30 3.75ZM38.4434 30.4043L25.6465 39.7148C25.5763 39.7653 25.4936 39.7954 25.4075 39.8018C25.3213 39.8083 25.2351 39.7909 25.1582 39.7515C25.0813 39.7122 25.0167 39.6524 24.9716 39.5787C24.9264 39.5051 24.9025 39.4204 24.9023 39.334V20.7246C24.9021 20.638 24.9258 20.5531 24.9708 20.4792C25.0158 20.4052 25.0805 20.3452 25.1575 20.3058C25.2346 20.2664 25.3211 20.249 25.4074 20.2557C25.4937 20.2624 25.5764 20.2929 25.6465 20.3438L38.4434 29.6484C38.5038 29.6912 38.5531 29.7478 38.5872 29.8136C38.6212 29.8794 38.639 29.9523 38.639 30.0264C38.639 30.1004 38.6212 30.1734 38.5872 30.2391C38.5531 30.3049 38.5038 30.3615 38.4434 30.4043Z" fill="black" />
                                <path d="M30 3.75C15.5039 3.75 3.75 15.5039 3.75 30C3.75 44.4961 15.5039 56.25 30 56.25C44.4961 56.25 56.25 44.4961 56.25 30C56.25 15.5039 44.4961 3.75 30 3.75ZM38.4434 30.4043L25.6465 39.7148C25.5763 39.7653 25.4936 39.7954 25.4075 39.8018C25.3213 39.8083 25.2351 39.7909 25.1582 39.7515C25.0813 39.7122 25.0167 39.6524 24.9716 39.5787C24.9264 39.5051 24.9025 39.4204 24.9023 39.334V20.7246C24.9021 20.638 24.9258 20.5531 24.9708 20.4792C25.0158 20.4052 25.0805 20.3452 25.1575 20.3058C25.2346 20.2664 25.3211 20.249 25.4074 20.2557C25.4937 20.2624 25.5764 20.2929 25.6465 20.3438L38.4434 29.6484C38.5038 29.6912 38.5531 29.7478 38.5872 29.8136C38.6212 29.8794 38.639 29.9523 38.639 30.0264C38.639 30.1004 38.6212 30.1734 38.5872 30.2391C38.5531 30.3049 38.5038 30.3615 38.4434 30.4043Z" stroke="white" />
                            </svg>
                        </div> :
                            <div className="h-12 items-center flex">
                                <svg onClick={pause} className="cursor-pointer active:scale-110 transition-all " width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M30 3.75C15.5039 3.75 3.75 15.5039 3.75 30C3.75 44.4961 15.5039 56.25 30 56.25C44.4961 56.25 56.25 44.4961 56.25 30C56.25 15.5039 44.4961 3.75 30 3.75ZM25.3125 38.9062C25.3125 39.1641 25.1016 39.375 24.8438 39.375H22.0312C21.7734 39.375 21.5625 39.1641 21.5625 38.9062V21.0938C21.5625 20.8359 21.7734 20.625 22.0312 20.625H24.8438C25.1016 20.625 25.3125 20.8359 25.3125 21.0938V38.9062ZM38.4375 38.9062C38.4375 39.1641 38.2266 39.375 37.9688 39.375H35.1562C34.8984 39.375 34.6875 39.1641 34.6875 38.9062V21.0938C34.6875 20.8359 34.8984 20.625 35.1562 20.625H37.9688C38.2266 20.625 38.4375 20.8359 38.4375 21.0938V38.9062Z" fill="white" />
                                </svg>
                            </div>}
                        <div className="relative w-12">
                            <div className="cursor-pointer select-none absolute z-[0] active:scale-110 active:border-2 transition-all text-2xl bg-[#5A20CB] p-2 flex flex-row [&>*]:ml-1 rounded-md border border-white border-solid " onClick={selectAlgo} ref={r => nextBtnRef.current = r} >Next
                                <svg width="2rem" height="2rem" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M30 2.5C14.8125 2.5 2.5 14.8125 2.5 30C2.5 45.1875 14.8125 57.5 30 57.5C45.1875 57.5 57.5 45.1875 57.5 30C57.5 14.8125 45.1875 2.5 30 2.5ZM25 22C25 21.2625 25.38 20.585 25.99 20.2375C26.2864 20.067 26.6258 19.9857 26.9673 20.0034C27.3088 20.0212 27.6379 20.1372 27.915 20.3375L39.165 28.3375C39.4262 28.5284 39.6381 28.7788 39.7833 29.0679C39.9285 29.357 40.0028 29.6765 40 30C40.0032 30.3239 39.9291 30.6439 39.7839 30.9335C39.6387 31.2231 39.4265 31.4738 39.165 31.665L27.915 39.665C27.6379 39.8653 27.3088 39.9813 26.9673 39.9991C26.6258 40.0168 26.2864 39.9355 25.99 39.765C25.6845 39.5837 25.4322 39.3251 25.2584 39.0152C25.0846 38.7054 24.9955 38.3552 25 38V22Z" fill="white" />
                                </svg>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
