
export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white p-0.5">
                <img
                    src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png"
                    alt="JMS Logo"
                    className="size-8 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    ERP JMS
                </span>
            </div>
        </>
    );
}
