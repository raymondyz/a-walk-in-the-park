type PhotosPanelProps = {
    isOpen: boolean;
    photosList: any[];
}

export default function PhotosPanel({ isOpen, photosList }: PhotosPanelProps) {
    if (!isOpen) return null;

    return (
        <div id="photos" className="absolute rounded-2xl bg-yellow-500 opacity-70 p-4 inset-4 z-10">
            <div className="grid grid-cols-3 gap-4">
                {photosList.map((photo) => (
                    <div className="bg-blue-400 h-[32vh] rounded-md">
                        <img src={photo}></img>
                    </div>
                ))}
            </div>
        </div>
    );
}