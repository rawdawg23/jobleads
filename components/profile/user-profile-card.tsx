"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Briefcase, Edit3, Save, X, Plus } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string | null
  bio: string | null
  location: string | null
  skills: string[] | null
  sustainability_preferences: any
  created_at: string
  updated_at: string
}

interface UserProfileCardProps {
  userId: string
  isEditable?: boolean
}

export function UserProfileCard({ userId, isEditable = false }: UserProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId, supabase])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          location: profile.location,
          skills: profile.skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim() || !profile) return

    const updatedSkills = [...(profile.skills || []), newSkill.trim()]
    setProfile({ ...profile, skills: updatedSkills })
    setNewSkill("")
  }

  const removeSkill = (skillToRemove: string) => {
    if (!profile) return

    const updatedSkills = (profile.skills || []).filter((skill) => skill !== skillToRemove)
    setProfile({ ...profile, skills: updatedSkills })
  }

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-20 bg-glass-light rounded-lg mb-4"></div>
        <div className="h-4 bg-glass-light rounded mb-2"></div>
        <div className="h-4 bg-glass-light rounded w-3/4"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-glass-text">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header with avatar and basic info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="glass-avatar">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={profile.first_name || ""}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="First name"
                    className="glass-input"
                  />
                  <Input
                    value={profile.last_name || ""}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Last name"
                    className="glass-input"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.email}
                </h3>
                <p className="text-glass-text">{profile.email}</p>
              </div>
            )}
          </div>
        </div>

        {isEditable && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={saving} className="glass-button-primary" size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="glass-button-secondary"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="glass-button-secondary" size="sm">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Role and Location */}
      <div className="flex flex-wrap gap-4 text-sm text-glass-text">
        {profile.role && (
          <div className="flex items-center space-x-1">
            <Briefcase className="h-4 w-4" />
            <span className="capitalize">{profile.role}</span>
          </div>
        )}
        {(isEditing ? true : profile.location) && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            {isEditing ? (
              <Input
                value={profile.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="Location"
                className="glass-input w-32"
              />
            ) : (
              <span>{profile.location}</span>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      <div>
        <h4 className="text-sm font-medium text-white mb-2">About</h4>
        {isEditing ? (
          <Textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="glass-input min-h-[100px]"
          />
        ) : (
          <p className="text-glass-text">{profile.bio || "No bio available"}</p>
        )}
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-sm font-medium text-white mb-2">Skills</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {(profile.skills || []).map((skill, index) => (
            <Badge key={index} className="glass-badge">
              {skill}
              {isEditing && (
                <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        {isEditing && (
          <div className="flex space-x-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              className="glass-input flex-1"
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} className="glass-button-secondary" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Member since */}
      <div className="pt-4 border-t border-glass-border">
        <p className="text-xs text-glass-text">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
