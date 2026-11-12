type PhotosPanelProps = {
    isOpen: boolean;
    photosList: any[];
}

export default function PhotosPanel({ isOpen, photosList }: PhotosPanelProps) {
    if (!isOpen) return null;

    return (
        <div id="photos" className="absolute rounded-2xl bg-yellow-500/70 p-4 pointer-events-auto inset-4 overflow-hidden z-10">
            <div className="auto-rows-[32vh] grid grid-cols-3 gap-4 h-full overflow-y-auto">
                {photosList.map((photo) => (
                    <div className="bg-blue-400 h-[32vh] overflow-hidden rounded-md">
                        <img className="block h-full w-full object-cover" src={photo}></img>
                    </div>
                ))}
            </div>
        </div>
    );
}