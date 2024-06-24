import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";
import LogoutButton from "../components/LogoutButton";

const prisma = new PrismaClient();

async function getUser() {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        const userId = payload.userId as string;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true, email: true },
        });

        await prisma.$disconnect();
        return user;
    }

    return null;
}

export default async function DashboardPage() {
    const user = await getUser();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        Welcome to your Dashboard
                    </h2>
                    <p className='mt-2 text-center text-sm text-gray-600'>
                        Hello, {user.firstName} {user.lastName}!
                    </p>
                    <p className='mt-2 text-center text-sm text-gray-600'>Email: {user.email}</p>
                </div>
                <div className='mt-4 text-center'>
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
