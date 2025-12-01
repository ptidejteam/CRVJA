"use client";
import React, { useState, useRef } from "react";

// -----------------------------
//  WORKBENCH COLORS
// -----------------------------
export const WB_COLORS = {
    screenBlue: "#003C98",
    borderDark: "#00245F",
    borderLight: "#FFFFFF",
    titleBar: "#955D29",
    titleText: "#FFFFFF",
    windowBG: "#D6D6D6",
};

// -----------------------------
//  WINDOW COMPONENT
// -----------------------------
export function WorkbenchWindow({
    title,
    children,
    requestFront,
    globalZ,
    defaultPos = { x: 120, y: 90 },
    onClose,
}) {
    const [pos, setPos] = useState(defaultPos);
    const [isDragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [fullscreen, setFullscreen] = useState(false);
    const [zIndex, setZIndex] = useState(1);
    const [size, setSize] = useState({ width: 400, height: 400 });
    const [isHovered, setIsHovered] = useState(false);
    const [myZ, setMyZ] = useState(globalZ);

    const bringToFront = () => {
        requestFront();       // ask shell to raise global Z
        setMyZ(globalZ + 1);  // assign the new top value to this window
    };
    const sendToBack = () => setZIndex(1);

    const windowRef = useRef(null);

    const startDrag = (e) => {
        const rect = windowRef.current.getBoundingClientRect();
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setDragging(true);
    };

    const drag = (e) => {
        if (!isDragging || fullscreen) return;
        setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const stopDrag = () => setDragging(false);
    React.useEffect(() => {
        const handleKey = (e) => {
            if (!isHovered || !e.shiftKey) return;

            let delta = 100;

            if (e.key === "q" || e.key === "Q") {
                // decrease width
                setSize(s => ({ ...s, width: Math.max(200, s.width - delta) }));
            }
            if (e.key === "e" || e.key === "E") {
                // increase width
                setSize(s => ({ ...s, width: s.width + delta }));
            }
            if (e.key === "a" || e.key === "A") {
                // decrease height
                setSize(s => ({ ...s, height: Math.max(150, s.height - delta) }));
            }
            if (e.key === "d" || e.key === "D") {
                // increase height
                setSize(s => ({ ...s, height: s.height + delta }));
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isHovered]);
    return (
        <div
            ref={windowRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={drag}
            onMouseUp={stopDrag}
            onMouseDown={bringToFront}
            style={{
                position: "absolute",
                top: fullscreen ? 0 : pos.y,
                left: fullscreen ? 0 : pos.x,
                width: fullscreen ? "100%" : size.width,
                height: fullscreen ? "100%" : size.height,
                minWidth: "300px",
                border: `3px solid ${WB_COLORS.borderDark}`,
                boxShadow: "4px 4px 0 #000",
                background: WB_COLORS.windowBG,
                userSelect: "none",
                zIndex: myZ,
                overflow: "auto"
            }}
        >

            {/* TITLE BAR */}
            <div
                onMouseDown={startDrag}
                style={{
                    background: "#C0C0C0",
                    color: "black",
                    padding: "3px 8px",
                    fontFamily: "Amiga4Ever, monospace",
                    display: "flex",
                    alignItems: "center",

                    cursor: "move",
                    borderBottom: "2px solid black",
                }}
            >
                {/* CLOSE */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    style={{
                        width: 14,
                        height: 14,
                        background: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                        border: `4px solid ${WB_COLORS.screenBlue}`,
                        cursor: "pointer",
                        marginRight: "1%",
                    }}
                >
                    <div style={{ backgroundColor: "black", width: "4px", height: "4px" }} />


                </div>

                <span style={{ paddingLeft: "5px", borderLeft: `2px solid ${WB_COLORS.screenBlue}` }} >{title}</span>
                <div style={{ width: "100%", height: "14px" }} >
                    <div style={{ backgroundColor: WB_COLORS.screenBlue, height: "2px", width: "100%" }} />
                    <div style={{ height: "2px", width: "100%" }} />
                    <div style={{ backgroundColor: WB_COLORS.screenBlue, height: "2px", width: "100%" }} />
                    <div style={{ height: "2px", width: "100%" }} />
                    <div style={{ backgroundColor: WB_COLORS.screenBlue, height: "2px", width: "100%" }} />
                </div>

                <div style={{ display: "flex", gap: "6px" }}>

                    {/* DEPTH */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            sendToBack();
                        }}
                        style={{
                            borderInline: `2px solid ${WB_COLORS.screenBlue}`,
                            height: "26px",
                            paddingInline: "4px",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{
                            width: 14, height: 14, background: "#FFFFFF",
                            border: `1px solid ${WB_COLORS.screenBlue}`,
                        }} />

                        <div style={{
                            width: 14, height: 14, background: "#000",
                            border: "1px solid white",
                            position: "relative", top: -12, left: 3,
                        }} />
                    </div>

                    {/* ZOOM */}
                    <div
                        style={{ borderInline: `2px solid ${WB_COLORS.screenBlue}`, height: "26px", paddingInline: "4px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setFullscreen(!fullscreen);
                        }}
                    >
                        <div style={{
                            width: 14, height: 14, background: "#000",
                            border: "1px solid white",
                        }} />
                        <div style={{
                            width: 14, height: 14, background: "#FFF",
                            border: `1px solid ${WB_COLORS.screenBlue}`,
                            position: "relative", top: -12, left: 3,
                        }} />
                    </div>


                </div>
            </div>

            {/* CONTENT */}
            <div style={{ padding: "8px", overflow: "auto" }}>
                {children}
            </div>
        </div>
    );
}


// -----------------------------
//  WORKBENCH ICON
// -----------------------------
export function WorkbenchIcon({
    id,
    label,
    icon,
    onOpen,
    selected,
    setSelectedIcon
}) {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = (e) => {
        e.stopPropagation(); // prevent desktop from clearing

        // select this icon
        setSelectedIcon(id);

        setClickCount((c) => c + 1);
        setTimeout(() => setClickCount(0), 250);

        if (clickCount === 1) onOpen(); // double click open
    };

    return (
        <div
            onClick={handleClick}
            style={{
                width: 80,
                textAlign: "center",
                cursor: "pointer",
                fontFamily: "Amiga4Ever, monospace",
                color: "white",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                position: "relative",
                padding: "4px",
            }}
        >
            {/* ICON IMAGE */}
            <div
                style={{
                    width: 48,
                    height: 48,
                    backgroundImage: `url(${icon})`,
                    backgroundSize: "cover",
                    pointerEvents: "none",
                }}
            />

            {/* BLUE SELECTION OVERLAY */}
            {selected && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(30,144,255,0.25)",
                        border: "1px solid rgba(30,144,255,0.8)",
                        borderRadius: "4px",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* ICON LABEL */}
            <span>{label}</span>
        </div>
    );
}


// -----------------------------
//  WORKBENCH DESKTOP SHELL
// -----------------------------
export function WorkbenchShell({ children }) {
    const [globalZ, setGlobalZ] = useState(10);
    return (
        <div

            style={{
                width: "100vw",
                height: "100vh",
                background: WB_COLORS.screenBlue,

                position: "relative",
                overflow: "hidden",
                fontFamily: "Amiga4Ever, monospace",
            }}
        >
            {/* TOP WORKBENCH BAR */}
            <div
                style={{
                    width: "100%",
                    padding: "4px 10px",
                    background: WB_COLORS.windowBG,
                    borderBottom: `3px solid ${WB_COLORS.borderDark}`,
                    fontWeight: "bold",
                }}
            >
                AMOS Basic parser to JavaScript Version 1.0
            </div>

            {React.Children.map(children, child => {
                if (!React.isValidElement(child)) return child; // <-- SKIP null, strings, etc.

                return React.cloneElement(child, {
                    requestFront: () => setGlobalZ((z) => z + 1),
                    globalZ
                });
            })}

        </div>
    );
}
