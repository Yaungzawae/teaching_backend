import ManualPaymentCard from "@/components/cards/ManualPaymentCard";
import TeacherInfoCard from "@/components/cards/TeacherInfoCard";
import TeacherCreateForm from "@/components/forms/TeacherCreateForm";
import EditTestimonialForm from "@/components/forms/EditTestimonialForm"; // Import EditTestimonialForm
import { H3 } from "@/components/typography/typography";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import axios from "axios";
import { useEffect, useState } from "react";
Input

const PasswordPrompt = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/admin-login', { password });
            onSuccess();
        } catch (err) {
            setError(err.response.data.errors.message);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-md">
                <h2 className="text-2xl mb-4">Enter Admin Password</h2>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4"
                    placeholder="Password"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <Button type="submit" className="w-full">Submit</Button>
            </form>
        </div>
    );
};

const AdminPage = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [[pending, accepted, denied], setData] = useState([[], [], []]);
    const [teachers, setTeachers] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.post("/api/payment/manual/get");
            const response2 = await axios.post("/api/teacher/get-all-teachers");
            setData(response.data);
            setTeachers(response2.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (isAuthorized) {
            fetchData();
        }
    }, [isAuthorized]);

    if (!isAuthorized) {
        return <PasswordPrompt onSuccess={() => setIsAuthorized(true)} />;
    }

    return (
        <div className="container mx-auto px-4">
            <Tabs defaultValue="manualPayments" className="mb-8">
                <TabsList className="flex">
                    <TabsTrigger value="manualPayments">Manual Payments</TabsTrigger>
                    <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
                    <TabsTrigger value="teacher">Create Teacher</TabsTrigger>
                    <TabsTrigger value="testimonials">Edit Testimonials</TabsTrigger> {/* Add testimonials tab */}
                </TabsList>

                <TabsContent value="manualPayments">
                    <Tabs defaultValue="pending" className="mt-4">
                        <TabsList className="flex">
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="accepted">Accepted</TabsTrigger>
                            <TabsTrigger value="denied">Denied</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending">
                            {pending.length === 0 ? (
                                <H3>There are no pending requests</H3>
                            ) : (
                                pending.map((entry) => (
                                    <ManualPaymentCard key={entry._id} entry={entry} onSend={send} showButtons={true} />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="accepted">
                            {accepted.length === 0 ? (
                                <H3>There are no accepted payments</H3>
                            ) : (
                                accepted.map((entry) => (
                                    <ManualPaymentCard key={entry._id} entry={entry} onSend={send} />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="denied">
                            {denied.length === 0 ? (
                                <H3>There are no denied payments</H3>
                            ) : (
                                denied.map((entry) => (
                                    <ManualPaymentCard key={entry._id} entry={entry} onSend={send} />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="teachers">
                    {teachers.map(teacher => {
                        return <TeacherInfoCard isEditable={false} isDeleteable={true} tr_data={teacher} />
                    })}
                </TabsContent>

                <TabsContent value="teacher">
                    <TeacherCreateForm />
                </TabsContent>

                <TabsContent value="testimonials"> {/* Use the testimonials tab */}
                    <EditTestimonialForm /> {/* Render the EditTestimonialForm component */}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;
